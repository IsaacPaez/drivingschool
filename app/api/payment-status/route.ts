import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const {
      userId,
      productId,
      paymentStatus,
      paymentId
    } = await request.json();

    if (!userId || !productId || !paymentStatus) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (paymentStatus === 'completed') {
      // Update all pending slots for this user and product to 'booked'
      const result = await User.updateMany(
        {
          role: 'instructor',
          'schedule_driving_lesson': {
            $elemMatch: {
              studentId: userId,
              selectedProduct: productId,
              status: 'pending'
            }
          }
        },
        {
          $set: {
            'schedule_driving_lesson.$.status': 'booked',
            'schedule_driving_lesson.$.paid': true,
            'schedule_driving_lesson.$.paymentId': paymentId,
            'schedule_driving_lesson.$.confirmedAt': new Date()
          }
        }
      );

      return NextResponse.json({
        success: true,
        message: 'Payment confirmed and slots booked',
        slotsUpdated: result.modifiedCount
      });

    } else if (paymentStatus === 'failed' || paymentStatus === 'cancelled') {
      // Revert pending slots back to available
      const result = await User.updateMany(
        {
          role: 'instructor',
          'schedule_driving_lesson': {
            $elemMatch: {
              studentId: userId,
              selectedProduct: productId,
              status: 'pending'
            }
          }
        },
        {
          $set: {
            'schedule_driving_lesson.$.status': 'available',
            'schedule_driving_lesson.$.studentId': null,
            'schedule_driving_lesson.$.selectedProduct': null,
            'schedule_driving_lesson.$.pickupLocation': null,
            'schedule_driving_lesson.$.dropOffLocation': null,
            'schedule_driving_lesson.$.paymentMethod': null,
            'schedule_driving_lesson.$.requestDate': null,
            'schedule_driving_lesson.$.paid': false
          }
        }
      );

      return NextResponse.json({
        success: true,
        message: 'Payment failed, slots returned to available',
        slotsUpdated: result.modifiedCount
      });
    }

    return NextResponse.json(
      { error: 'Invalid payment status' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error updating payment status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
