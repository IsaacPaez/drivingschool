import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Instructor from "@/models/Instructor";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const {
      userId,
      instructorId,
      date,
      start,
      end,
      classType,
      amount,
      pickupLocation,
      dropoffLocation,
      orderId,
      orderNumber
    } = await req.json();

    console.log('🛒 Adding driving test to cart:', {
      userId,
      instructorId,
      date,
      start,
      end,
      amount
    });

    // Validar datos requeridos
    if (!userId || !instructorId || !date || !start || !end) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validar ObjectIds
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(instructorId)) {
      return NextResponse.json(
        { error: "Invalid user or instructor ID" },
        { status: 400 }
      );
    }

    // Buscar el instructor
    const instructor = await Instructor.findById(instructorId);
    if (!instructor) {
      return NextResponse.json(
        { error: "Instructor not found" },
        { status: 404 }
      );
    }

    // Buscar el slot específico en schedule_driving_test
    const slot = instructor.schedule_driving_test?.find((s: {
      date: string;
      start: string;
      end: string;
      status: string;
      booked?: boolean;
      studentId?: string;
    }) => 
      s.date === date && s.start === start && s.end === end
    );

    if (!slot) {
      return NextResponse.json(
        { error: "Slot not found" },
        { status: 404 }
      );
    }

    // Verificar que el slot esté disponible
    if (slot.status !== 'available' && slot.status !== 'free') {
      return NextResponse.json(
        { error: "Slot is not available" },
        { status: 400 }
      );
    }

    // Verificar que el slot no esté ya reservado
    if (slot.booked || slot.studentId) {
      return NextResponse.json(
        { error: "Slot is already booked" },
        { status: 400 }
      );
    }

    // Buscar el usuario
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Crear el item del carrito
    const cartItem = {
      instructorId: instructorId,
      instructorName: instructor.name,
      instructorPhoto: instructor.photo || "",
      date: date,
      start: start,
      end: end,
      classType: classType || "driving test",
      amount: amount || 50,
      pickupLocation: pickupLocation || "",
      dropoffLocation: dropoffLocation || "",
      orderId: orderId || null,
      orderNumber: orderNumber || null,
      addedAt: new Date()
    };

    // Verificar si ya existe en el carrito
    const existingCartItem = user.cart?.find((item: {
      instructorId: string;
      date: string;
      start: string;
      classType: string;
    }) => 
      item.instructorId.toString() === instructorId &&
      item.date === date &&
      item.start === start &&
      item.classType === classType
    );

    if (existingCartItem) {
      return NextResponse.json(
        { error: "This slot is already in your cart" },
        { status: 400 }
      );
    }

    // Agregar al carrito del usuario
    if (!user.cart) {
      user.cart = [];
    }
    user.cart.push(cartItem);
    await user.save();

    // Actualizar el slot a status "pending"
    slot.status = 'pending';
    slot.studentId = userId;
    slot.booked = false; // Aún no está completamente reservado hasta que se pague
    slot.pickupLocation = pickupLocation || "";
    slot.dropoffLocation = dropoffLocation || "";
    
    // Add order information if provided
    if (orderId) {
      slot.orderId = orderId;
    }
    if (orderNumber) {
      slot.orderNumber = orderNumber;
    }
    
    await instructor.save();

    console.log('✅ Driving test added to cart successfully');

    return NextResponse.json({
      success: true,
      message: "Driving test added to cart successfully",
      cartItem: cartItem
    });

  } catch (error) {
    console.error("❌ Error adding driving test to cart:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
