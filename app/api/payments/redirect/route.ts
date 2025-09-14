import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Cart from "@/models/Cart";
import Order from '@/models/Order';
import { startAndWaitEC2 } from "@/app/api/checkout/aws-ec2";
import { secureFetch } from "@/app/utils/secure-fetch";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
const EC2_URL = "https://botopiapagosatldriving.xyz";

// Función helper para crear customer_code de 8 dígitos
function createCustomerCode(userId: string, orderId: string): string {
  const userSuffix = userId.slice(-4);  // últimos 4 dígitos del userId
  const orderSuffix = orderId.slice(-4); // últimos 4 dígitos del orderId
  return `${userSuffix}${orderSuffix}`;  // total: 8 dígitos
}

async function getRedirectUrlFromEC2(payload) {
  let attempt = 1;
  let lastError: string = "";
  for (let i = 0; i < 2; i++) { // máximo 2 intentos
    try {
      //console.log(`[API][redirect] Intento #${attempt} de obtener redirectUrl del EC2`);
      const ec2Response = await secureFetch(`${EC2_URL}/api/payments/redirect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      //console.log(`[API][redirect] Respuesta de EC2 status (intento ${attempt}):`, ec2Response.status);
      if (ec2Response.ok) {
        const responseData = await ec2Response.json();
        //console.log(`[API][redirect] Respuesta de EC2 (intento ${attempt}):`, responseData);
        if (responseData.redirectUrl && typeof responseData.redirectUrl === "string") {
          return responseData.redirectUrl;
        } else {
          throw new Error("Invalid redirect URL received from EC2");
        }
      } else if (ec2Response.status === 401 && i === 0) {
        // Solo reintenta una vez si es 401
        lastError = await ec2Response.text();
        console.warn(`[API][redirect] 401 recibido, reintentando. Detalle:`, lastError);
        attempt++;
        continue;
      } else {
        lastError = await ec2Response.text();
        throw new Error(`EC2 error: ${ec2Response.status} - ${lastError}`);
      }
    } catch (err: any) {
      lastError = err instanceof Error ? err.message : String(err);
      console.error(`[API][redirect] Error en intento #${attempt}:`, err);
      attempt++;
    }
  }
  throw new Error(`No se pudo obtener redirectUrl del EC2 tras 2 intentos. Último error: ${lastError}`);
}

// Espera a que el backend EC2 esté listo (responda en /health)
async function waitForBackendReady(url, maxTries = 20, delayMs = 3000, fetchTimeoutMs = 2000) {
  for (let i = 0; i < maxTries; i++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), fetchTimeoutMs);
    try {
      const res = await fetch(url, { method: "GET", signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        //console.log(`[EC2] Backend listo en intento ${i + 1}`);
        return true;
      }
    } catch (e) {
      // Ignora el error, solo espera y reintenta
    } finally {
      clearTimeout(timeoutId);
    }
    //console.log(`[EC2] Esperando backend... intento ${i + 1}`);
    await new Promise(r => setTimeout(r, delayMs));
  }
  return false;
}

export async function GET(req: NextRequest) {
  //console.log("=== INICIO /api/payments/redirect ===");
  try {
    // 1. Espera a que EC2 esté encendida
    //console.log("Llamando a startAndWaitEC2 con ID:", process.env.EC2_INSTANCE_ID);
    const ec2Result = await startAndWaitEC2(process.env.EC2_INSTANCE_ID!);
    //console.log("Resultado de startAndWaitEC2:", ec2Result);
    const ok = ec2Result.success;
    const publicIp = ec2Result.publicIp;
    if (!ok) {
      return NextResponse.json({ 
        error: "ec2", 
        message: "No se pudo encender la instancia EC2",
        details: ec2Result.error || "Unknown error"
      }, { status: 500 });
    }

    // 2. Espera a que el backend esté listo
    const backendReady = await waitForBackendReady(`${EC2_URL}/health`);
    if (!backendReady) {
      return NextResponse.json({
        error: "ec2",
        message: "La instancia EC2 está encendida pero el backend no responde."
      }, { status: 500 });
    }

    // 3. Ahora conecta a la DB y procesa la orden
    await connectDB();
    //console.log("[API][redirect] DB conectada");
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const orderId = searchParams.get("orderId");
    //console.log("[API][redirect] Params:", { userId, orderId });

    if (!userId) {
      console.log("[API][redirect] Falta userId, redirigiendo a login");
      return NextResponse.redirect(`${BASE_URL}/login`);
    }
    
    const user = await User.findById(userId);
    //console.log("[API][redirect] Usuario:", user);
    if (!user) {
      //console.log("[API][redirect] Usuario no encontrado, redirigiendo a login");
      return NextResponse.redirect(`${BASE_URL}/login`);
    }

    let items, total, payload, orderToUse;
    if (orderId) {
      //console.log("[API][redirect] Buscando orden existente:", orderId);
      orderToUse = await Order.findById(orderId);
      if (!orderToUse) {
        //console.log("[API][redirect] Orden no encontrada, redirigiendo a cart");
        return NextResponse.redirect(`${BASE_URL}/cart?error=order-not-found`);
      }
      items = orderToUse.items;
      total = orderToUse.total;
      //console.log("[API][redirect] Usando orden existente", { items, total });
    } else {
      //console.log("[API][redirect] Buscando carrito para usuario:", userId);
      
      // Buscar en el carrito del usuario (para driving-lessons)
      console.log("[API][redirect] User object:", {
        _id: user?._id,
        name: user?.name,
        cartLength: user?.cart?.length,
        cart: user?.cart
      });
      
      if (user && user.cart && user.cart.length > 0) {
        console.log("[API][redirect] Carrito encontrado en usuario:", user.cart.length, "items");
        
        // Filtrar solo items válidos para el pago (que tengan price O amount como número)
        const validItems = user.cart.filter(item => 
          item && 
          ((typeof item.price === 'number' && !isNaN(item.price) && item.price > 0) ||
           (typeof item.amount === 'number' && !isNaN(item.amount) && item.amount > 0)) &&
          (item.id || item.classType) &&
          (item.title || item.classType)
        );
        
        console.log("[API][redirect] Items válidos para pago:", validItems.length);
        console.log("[API][redirect] Items inválidos filtrados:", user.cart.length - validItems.length);
        
        if (validItems.length === 0) {
          console.log("[API][redirect] No hay items válidos en el carrito para procesar pago");
          return NextResponse.json({ 
            error: "cart", 
            message: "No valid items found in cart for payment processing." 
          }, { status: 400 });
        }
        
        // Asegurar que todos los items tengan la estructura correcta
        items = validItems.map(item => ({
          id: item.id || `driving_test_${item.instructorId}_${item.date}_${item.start}`,
          title: item.title || item.classType || 'Driving Test',
          price: Number(item.price || item.amount || 0),
          quantity: Number(item.quantity || 1),
          ...item // Mantener otros campos como packageDetails, selectedSlots, etc.
        }));
        
        total = items.reduce((sum, item) => {
          const itemTotal = item.price * item.quantity;
          console.log(`[API][redirect] Item: ${item.title}, Price: ${item.price}, Quantity: ${item.quantity}, Total: ${itemTotal}`);
          return sum + itemTotal;
        }, 0);
        
        console.log("[API][redirect] Total del carrito calculado:", total);
        
        // Validar que el total sea un número válido
        if (isNaN(total) || total <= 0) {
          console.log("[API][redirect] ❌ Total inválido calculado:", total);
          return NextResponse.json({ 
            error: "calculation", 
            message: "Invalid total calculated from cart items." 
          }, { status: 400 });
        }
      } else {
        console.log("[API][redirect] Carrito del usuario vacío o null. user.cart:", user?.cart);
        
        // Si no hay carrito, buscar órdenes pendientes del usuario (para driving-lessons)
        const pendingOrders = await Order.find({ 
          userId, 
          paymentStatus: 'pending',
          orderType: 'driving_lesson_package'
        }).sort({ createdAt: -1 });
        
        if (pendingOrders && pendingOrders.length > 0) {
          console.log("[API][redirect] Encontradas órdenes pendientes:", pendingOrders.length);
          
          // Usar la orden más reciente
          const latestOrder = pendingOrders[0];
          items = latestOrder.items;
          total = latestOrder.total;
          orderToUse = latestOrder;
          
          console.log("[API][redirect] Usando orden pendiente:", {
            orderId: latestOrder._id,
            orderNumber: latestOrder.orderNumber,
            total: latestOrder.total
          });
        } else {
          // Si no hay órdenes pendientes, buscar en colección Cart (para otros productos)
          const cart = await Cart.findOne({ userId });
          if (!cart || !cart.items.length) {
            console.log("[API][redirect] Carrito vacío en todas las ubicaciones, redirigiendo a cart");
            return NextResponse.redirect(`${BASE_URL}/cart?error=empty`);
          }
          items = cart.items;
          total = cart.items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
        }
      }
      //console.log("[API][redirect] Carrito encontrado", { items, total });
    }

    let finalOrderId: string;
    if (!orderId) {
      if (orderToUse) {
        // Si ya tenemos una orden (como en driving-lessons), usarla
        console.log("[API][redirect] Usando orden existente:", orderToUse._id);
        finalOrderId = orderToUse._id.toString();
        
        // Actualizar el estado de pago de la orden
        await Order.updateOne(
          { _id: orderToUse._id },
          { $set: { paymentStatus: 'processing' } }
        );
        console.log("[API][redirect] Estado de pago de orden actualizado a 'processing'");
      } else {
        // Verificar si ya existe una orden pendiente para este usuario
        console.log("[API][redirect] Verificando si ya existe una orden pendiente para el usuario...");
        const existingOrder = await Order.findOne({
          userId: userId,
          paymentStatus: 'pending'
        }).sort({ createdAt: -1 });
        
        if (existingOrder) {
          console.log("[API][redirect] Usando orden existente:", existingOrder._id);
          finalOrderId = existingOrder._id.toString();
        } else {
          // Solo crear nueva orden si no hay una existente
          console.log("[API][redirect] Creando nueva orden...");
          const lastOrder = await Order.findOne({}).sort({ orderNumber: -1 });
          const nextOrderNumber = lastOrder ? lastOrder.orderNumber + 1 : 1;
          console.log("[API][redirect] Siguiente número de orden:", nextOrderNumber);
          
          const createdOrder = await Order.create({
            userId,
            orderType: 'general', // Agregar orderType para evitar error de validación
            items,
            total: Number(total.toFixed(2)),
            estado: 'pending',
            createdAt: new Date(),
            orderNumber: nextOrderNumber,
          });
          console.log("[API][redirect] Orden creada:", createdOrder._id);
          finalOrderId = createdOrder._id.toString();
        }
        
        // Limpiar carrito del usuario (para driving-lessons)
        if (user.cart && user.cart.length > 0) {
          user.cart = [];
          await user.save();
          console.log("[API][redirect] Carrito del usuario vaciado");
        } else {
          // Limpiar colección Cart (para otros productos)
          const deleteResult = await Cart.deleteOne({ userId });
          console.log("[API][redirect] Carrito de colección vaciado:", deleteResult);
        }
      }
    } else if (orderToUse) {
      finalOrderId = orderToUse._id.toString();
      // Si ya existe la orden, usar su total
      total = orderToUse.total || 0;
    } else {
      // orderId existe por control de flujo anterior, afirmamos tipo
      finalOrderId = orderId as string;
      // Buscar la orden para obtener el total
      const existingOrder = await Order.findById(orderId);
      if (existingOrder) {
        total = existingOrder.total || 0;
      }
    }

    payload = {
      amount: Number(total.toFixed(2)),
      firstName: user.firstName || "John",
      lastName: user.lastName || "Doe",
      email: user.email || "",
      phone: user.phoneNumber || "",
      streetAddress: user.streetAddress || "",
      city: user.city || "",
      state: user.state || "",
      zipCode: user.zipCode || "",
      dni: user.dni || "",
      items,
      // IDs en múltiples formas para mayor compatibilidad
      userId: userId,
      orderId: finalOrderId,
      user_id: userId,
      order_id: finalOrderId,
      customUserId: userId,
      customOrderId: finalOrderId,
      userIdentifier: userId,
      orderIdentifier: finalOrderId,

      // Datos codificados como respaldo
      encodedData: `uid:${userId}|oid:${finalOrderId}`,
      backupData: `${userId}:${finalOrderId}`,

      // Metadata adicional
      metadata: {
        userId: userId,
        orderId: finalOrderId,
        timestamp: Date.now(),
        source: "frontend-checkout"
      },

      // 🔑 CUSTOMER_CODE para ConvergePay (8 dígitos máximo)
      customer_code: createCustomerCode(userId as string, finalOrderId),
      customerCode: createCustomerCode(userId as string, finalOrderId), // alias alternativo

      // Estas URLs no se usan directamente para Converge, pero viajan al EC2
      cancelUrl: `${BASE_URL}/payment-retry?userId=${userId}&orderId=${finalOrderId}`,
      successUrl: `${BASE_URL}/payment-success?userId=${userId}&orderId=${finalOrderId}`
    };
    //console.log("[API][redirect] Payload para EC2:", payload);

    // Construir también parámetros redundantes para cuando el EC2 necesite redirigir
    const baseParams = new URLSearchParams({
      userId: userId as string,
      orderId: finalOrderId,
      user_id: userId as string,
      order_id: finalOrderId,
      uid: userId as string,
      oid: finalOrderId,
      data: `${userId as string}:${finalOrderId}`
    });

    // Usar función con reintento automático
    const redirectUrl = await getRedirectUrlFromEC2(payload);
    //console.log("[API][redirect] URL de redirección válida:", redirectUrl);
    return NextResponse.json({ redirectUrl });

  } catch (error) {
     console.error("[API][redirect] ❌ Error no manejado:", error);
    if (error instanceof Error) {
       console.error("[API][redirect] ❌ Error stack:", error.stack);
    }
    return NextResponse.json({ 
      error: "payment", 
      message: "There was an error processing the payment.", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  //console.log("=== INICIO /api/payments/redirect (POST) ===");
  try {
    // 1. Espera a que EC2 esté encendida
    //console.log("Llamando a startAndWaitEC2 con ID:", process.env.EC2_INSTANCE_ID);
    const ec2Result = await startAndWaitEC2(process.env.EC2_INSTANCE_ID!);
    //console.log("Resultado de startAndWaitEC2:", ec2Result);
    const ok = ec2Result.success;
    const publicIp = ec2Result.publicIp;
    if (!ok) {
      return NextResponse.json({ 
        error: "ec2", 
        message: "No se pudo encender la instancia EC2",
        details: ec2Result.error || "Unknown error"
      }, { status: 500 });
    }

    // 2. Espera a que el backend esté listo
    const backendReady = await waitForBackendReady(`${EC2_URL}/health`);
    if (!backendReady) {
      return NextResponse.json({ 
        error: "backend", 
        message: "Backend no está listo",
        details: "El servidor de pagos no está respondiendo"
      }, { status: 503 });
    }

    // 3. Obtener parámetros de la URL
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const orderId = searchParams.get('orderId');

    if (!userId || !orderId) {
      return NextResponse.json({ 
        error: "params", 
        message: "Missing required parameters",
        details: "userId and orderId are required"
      }, { status: 400 });
    }

    // 4. Conectar a la base de datos
    await connectDB();

    // 5. Buscar usuario
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ 
        error: "user", 
        message: "User not found",
        details: `User with ID ${userId} not found`
      }, { status: 404 });
    }

    // 6. Buscar orden existente o crear nueva
    let orderToUse = await Order.findById(orderId);
    let finalOrderId: string;
    let items: any[] = [];
    let total = 0;

    if (!orderToUse) {
      // Buscar en el carrito del usuario
      let cartItems: any[] = [];
      
      if (user.cart && user.cart.length > 0) {
        cartItems = user.cart;
      } else {
        const cartDoc = await Cart.findOne({ userId });
        if (cartDoc && cartDoc.items) {
          cartItems = cartDoc.items;
        }
      }

      if (cartItems.length === 0) {
        return NextResponse.json({ 
          error: "cart", 
          message: "Cart is empty",
          details: "No items found in cart"
        }, { status: 400 });
      }

      // Procesar items del carrito
      items = cartItems.map(item => ({
        name: item.title || item.name || "Driving Service",
        quantity: item.quantity || 1,
        price: item.price || 0,
        description: item.description || item.packageDetails || "Driving lesson package"
      }));

      total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      // Crear nueva orden
      const nextOrderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 100)}`;
      const createdOrder = await Order.create({
        userId,
        items,
        total: Number(total.toFixed(2)),
        estado: 'pending',
        createdAt: new Date(),
        orderNumber: nextOrderNumber,
      });
      console.log("[API][redirect] Orden creada:", createdOrder._id);
      finalOrderId = createdOrder._id.toString();
      
      // Limpiar carrito del usuario (para driving-lessons)
      if (user.cart && user.cart.length > 0) {
        user.cart = [];
        await user.save();
        console.log("[API][redirect] Carrito del usuario vaciado");
      } else {
        // Limpiar colección Cart (para otros productos)
        const deleteResult = await Cart.deleteOne({ userId });
        console.log("[API][redirect] Carrito de colección vaciado:", deleteResult);
      }
    } else if (orderToUse) {
      finalOrderId = orderToUse._id.toString();
      // Si ya existe la orden, usar su total
      total = orderToUse.total || 0;
    } else {
      // orderId existe por control de flujo anterior, afirmamos tipo
      finalOrderId = orderId as string;
      // Buscar la orden para obtener el total
      const existingOrder = await Order.findById(orderId);
      if (existingOrder) {
        total = existingOrder.total || 0;
      }
    }

    const payload = {
      amount: Number(total.toFixed(2)),
      firstName: user.firstName || "John",
      lastName: user.lastName || "Doe",
      email: user.email || "",
      phone: user.phoneNumber || "",
      streetAddress: user.streetAddress || "",
      city: user.city || "",
      state: user.state || "",
      zipCode: user.zipCode || "",
      dni: user.dni || "",
      items,
      // IDs en múltiples formas para mayor compatibilidad
      userId: userId,
      orderId: finalOrderId,
      user_id: userId,
      order_id: finalOrderId,
      customUserId: userId,
      customOrderId: finalOrderId,
      userIdentifier: userId,
      orderIdentifier: finalOrderId,

      // Datos codificados como respaldo
      encodedData: `uid:${userId}|oid:${finalOrderId}`,
      backupData: `${userId}:${finalOrderId}`,

      // Metadata adicional
      metadata: {
        userId: userId,
        orderId: finalOrderId,
        timestamp: Date.now(),
        source: "frontend-checkout"
      },

      // 🔑 CUSTOMER_CODE para ConvergePay (8 dígitos máximo)
      customer_code: createCustomerCode(userId as string, finalOrderId),
      customerCode: createCustomerCode(userId as string, finalOrderId), // alias alternativo

      // Estas URLs no se usan directamente para Converge, pero viajan al EC2
      cancelUrl: `${BASE_URL}/payment-retry?userId=${userId}&orderId=${finalOrderId}`,
      successUrl: `${BASE_URL}/payment-success?userId=${userId}&orderId=${finalOrderId}`
    };
    //console.log("[API][redirect] Payload para EC2:", payload);

    // Construir también parámetros redundantes para cuando el EC2 necesite redirigir
    const baseParams = new URLSearchParams({
      userId: userId as string,
      orderId: finalOrderId,
      user_id: userId as string,
      order_id: finalOrderId,
      uid: userId as string,
      oid: finalOrderId,
      data: `${userId as string}:${finalOrderId}`
    });

    // Usar función con reintento automático
    const redirectUrl = await getRedirectUrlFromEC2(payload);
    //console.log("[API][redirect] URL de redirección válida:", redirectUrl);
    return NextResponse.json({ redirectUrl });

  } catch (error) {
     console.error("[API][redirect] ❌ Error no manejado:", error);
    if (error instanceof Error) {
       console.error("[API][redirect] ❌ Error stack:", error.stack);
    }
    return NextResponse.json({ 
      error: "payment", 
      message: "There was an error processing the payment.", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
