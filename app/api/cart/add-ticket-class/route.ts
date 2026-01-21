import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import TicketClass from "@/models/TicketClass";
import mongoose from "mongoose";

interface StudentRequest {
  studentId: mongoose.Types.ObjectId;
  requestDate: Date;
  status: string;
  paymentMethod: string;
  reason?: string;
}

interface CartItem {
  ticketClassId?: string;
}

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
      title,
      reason
    } = await req.json();

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
      (request: StudentRequest) => request.studentId.toString() === userId
    );

    if (isAlreadyRequested) {
      return NextResponse.json(
        { error: "You have already requested this ticket class" },
        { status: 400 }
      );
    }

    // Crear el item del carrito
    const cartItem = {
      id: `ticket_${ticketClassId}_${Date.now()}`,
      title: title || ticketClass.type || "Traffic Law & Substance Abuse Class",
      price: amount || 50,
      quantity: 1,
      classType: 'ticket',
      ticketClassId: ticketClassId,
      slotId: ticketClassId,
      date: date,
      start: start,
      end: end,
      instructorId: instructorId,
      instructorName: instructorName,
      addedAt: new Date()
    };

    // Verificar si ya existe en el carrito
    const existingCartItem = user.cart?.find((item: CartItem) =>
      item.ticketClassId?.toString() === ticketClassId
    );

    if (existingCartItem) {
      return NextResponse.json(
        { error: "This ticket class is already in your cart" },
        { status: 400 }
      );
    }

    // Agregar student request a la ticket class
    try {
      const newStudentRequest = {
        studentId: new mongoose.Types.ObjectId(userId),
        requestDate: new Date(),
        status: 'pending',
        paymentMethod: 'online',
        reason: reason || undefined
      };

      const updateResult = await TicketClass.updateOne(
        { _id: ticketClassId },
        {
          $push: {
            studentRequests: newStudentRequest
          },
          $set: {
            updatedAt: new Date()
          }
        }
      );

      if (updateResult.modifiedCount === 0) {
        throw new Error('Failed to update ticket class - no documents modified');
      }
    } catch (updateError) {
      console.error('Error updating ticket class:', updateError);
      return NextResponse.json(
        { error: "Failed to add student request to ticket class", details: (updateError as Error).message },
        { status: 500 }
      );
    }

    // Agregar al carrito del usuario
    try {
      await User.findByIdAndUpdate(
        userId,
        { $push: { cart: cartItem } },
        { runValidators: false }
      );
    } catch (userSaveError) {
      console.error('Error saving user cart:', userSaveError);
      return NextResponse.json(
        { error: "Failed to add to user cart", details: (userSaveError as Error).message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Ticket class added to cart successfully",
      cartItem: cartItem
    });

  } catch (error) {
    console.error('Error adding ticket class to cart:', error);
    return NextResponse.json(
      { error: "Internal server error", details: (error as Error).message },
      { status: 500 }
    );
  }
}
