import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TicketClass from "@/models/TicketClass";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { ticketClassId, studentId, status, paymentId, orderId } = await req.json();

    console.log('🔄 [TICKET CLASS UPDATE] Updating ticket class status:', {
      ticketClassId,
      studentId,
      status,
      paymentId,
      orderId
    });

    if (!ticketClassId || !studentId || !status) {
      return NextResponse.json(
        { error: "Missing required fields: ticketClassId, studentId, status" },
        { status: 400 }
      );
    }

    // Find the ticket class
    const ticketClass = await TicketClass.findById(ticketClassId);
    if (!ticketClass) {
      return NextResponse.json(
        { error: "Ticket class not found" },
        { status: 404 }
      );
    }

    console.log('✅ [TICKET CLASS UPDATE] Found ticket class:', {
      id: ticketClass._id,
      type: ticketClass.type,
      date: ticketClass.date,
      hour: ticketClass.hour,
      studentsCount: ticketClass.students?.length || 0,
      requestsCount: ticketClass.studentRequests?.length || 0
    });

    let updateResult;

    if (status === 'confirmed' || status === 'enrolled') {
      // Move student from requests to enrolled students
      console.log('📝 [TICKET CLASS UPDATE] Moving student from requests to enrolled students');
      
      // First, find and remove the student request
      const studentObjectId = new mongoose.Types.ObjectId(studentId);
      
      updateResult = await TicketClass.updateOne(
        { _id: ticketClassId },
        {
          $pull: { 
            studentRequests: { studentId: studentObjectId } 
          }
        }
      );

      if (updateResult.modifiedCount === 0) {
        console.log('⚠️ [TICKET CLASS UPDATE] No student request found to remove');
      } else {
        console.log('✅ [TICKET CLASS UPDATE] Removed student request');
      }

      // Then add the student to enrolled students
      const enrolledStudent = {
        studentId: studentObjectId,
        enrolledAt: new Date(),
        status: 'confirmed',
        paymentId: paymentId || null,
        orderId: orderId || null
      };

      updateResult = await TicketClass.updateOne(
        { _id: ticketClassId },
        { 
          $push: { 
            students: enrolledStudent 
          },
          $set: {
            updatedAt: new Date()
          }
        }
      );

      if (updateResult.modifiedCount === 0) {
        console.error('❌ [TICKET CLASS UPDATE] Failed to enroll student');
        return NextResponse.json(
          { error: "Failed to enroll student in ticket class" },
          { status: 500 }
        );
      }

      console.log('✅ [TICKET CLASS UPDATE] Student enrolled successfully');

    } else if (status === 'cancelled' || status === 'rejected') {
      // Remove student request (if payment failed)
      console.log('❌ [TICKET CLASS UPDATE] Removing student request due to payment failure');
      
      const studentObjectId = new mongoose.Types.ObjectId(studentId);
      
      updateResult = await TicketClass.updateOne(
        { _id: ticketClassId },
        {
          $pull: { 
            studentRequests: { studentId: studentObjectId } 
          },
          $set: {
            updatedAt: new Date()
          }
        }
      );

      if (updateResult.modifiedCount === 0) {
        console.log('⚠️ [TICKET CLASS UPDATE] No student request found to remove');
      } else {
        console.log('✅ [TICKET CLASS UPDATE] Removed student request');
      }
    }

    return NextResponse.json({
      success: true,
      message: `Ticket class student status updated to ${status}`,
      ticketClassId: ticketClassId,
      studentId: studentId,
      newStatus: status,
      modifiedCount: updateResult.modifiedCount
    });

  } catch (error) {
    console.error('❌ [TICKET CLASS UPDATE] Error updating ticket class status:', (error as any)?.message || error);
    return NextResponse.json(
      { error: (error as any)?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
