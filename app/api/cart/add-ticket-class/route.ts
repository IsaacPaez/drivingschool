import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import TicketClass from "@/models/TicketClass";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const {
      userId,
      ticketClassId,
      date,
      start,
      end,
      instructorId,
      instructorName,
      amount,
      title
    } = await req.json();

    console.log('🛒 Adding ticket class to cart:', {
      userId,
      ticketClassId,
      date,
      start,
      end,
      amount,
      title
    });

    // Validar datos requeridos
    if (!userId || !ticketClassId || !date || !start || !end) {
      return NextResponse.json(
        { error: "Missing required fields: userId, ticketClassId, date, start, end" },
        { status: 400 }
      );
    }

    // Validar ObjectIds
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(ticketClassId)) {
      return NextResponse.json(
        { error: "Invalid user or ticket class ID" },
        { status: 400 }
      );
    }

    // Buscar la ticket class
    const ticketClass = await TicketClass.findById(ticketClassId);
    if (!ticketClass) {
      return NextResponse.json(
        { error: "Ticket class not found" },
        { status: 404 }
      );
    }

    console.log('✅ Found ticket class:', ticketClass.title);

    // Buscar el slot específico en la ticket class
    // Los slots están en ticketClass directamente (no en un array como instructors)
    if (ticketClass.date !== date || ticketClass.hour !== start || ticketClass.endHour !== end) {
      return NextResponse.json(
        { error: "Slot time does not match ticket class schedule" },
        { status: 400 }
      );
    }

    // Verificar que el slot esté disponible
    if (ticketClass.status !== 'available') {
      return NextResponse.json(
        { error: "This ticket class is not available" },
        { status: 400 }
      );
    }

    // Verificar si ya hay cupos disponibles
    const enrolledStudents = ticketClass.students?.length || 0;
    const pendingRequests = ticketClass.studentRequests?.length || 0;
    const totalOccupied = enrolledStudents + pendingRequests;
    
    if (totalOccupied >= ticketClass.spots) {
      return NextResponse.json(
        { error: "No spots available in this ticket class" },
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

    // Verificar si ya está en studentRequests
    const isAlreadyRequested = ticketClass.studentRequests?.some(
      (request: any) => request.studentId.toString() === userId
    );

    if (isAlreadyRequested) {
      return NextResponse.json(
        { error: "You have already requested this ticket class" },
        { status: 400 }
      );
    }

    // Crear el item del carrito
    const cartItem = {
      id: `ticket_${ticketClassId}_${Date.now()}`, // ID único para el carrito
      title: title || ticketClass.title,
      price: amount || 50,
      quantity: 1,
      classType: 'ticket',
      ticketClassId: ticketClassId,
      slotId: ticketClassId, // Para ticket class, slotId es el mismo ticketClassId
      date: date,
      start: start,
      end: end,
      instructorId: instructorId,
      instructorName: instructorName,
      addedAt: new Date()
    };

    // Verificar si ya existe en el carrito
    const existingCartItem = user.cart?.find((item: any) => 
      item.ticketClassId?.toString() === ticketClassId
    );

    if (existingCartItem) {
      return NextResponse.json(
        { error: "This ticket class is already in your cart" },
        { status: 400 }
      );
    }

    // Agregar student request a la ticket class (equivalente a poner slot en "pending")
    if (!ticketClass.studentRequests) {
      ticketClass.studentRequests = [];
    }

    ticketClass.studentRequests.push({
      studentId: new mongoose.Types.ObjectId(userId),
      requestDate: new Date(),
      status: 'pending'
    });

    await ticketClass.save();
    console.log('✅ Added student request to ticket class');

    // Agregar al carrito del usuario
    if (!user.cart) {
      user.cart = [];
    }

    user.cart.push(cartItem);
    await user.save();

    console.log('✅ Ticket class added to user cart successfully');

    return NextResponse.json({
      success: true,
      message: "Ticket class added to cart successfully",
      cartItem: cartItem
    });

  } catch (error) {
    console.error('❌ Error adding ticket class to cart:', error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
