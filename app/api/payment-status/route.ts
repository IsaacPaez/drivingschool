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
      // Update all pending driving lesson slots for this user and product to 'booked'
      const drivingLessonResult = await User.updateMany(
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

      // Update all pending driving test slots for this user and product to 'booked'
      const drivingTestResult = await User.updateMany(
        {
          role: 'instructor',
          'schedule_driving_test': {
            $elemMatch: {
              studentId: userId,
              selectedProduct: productId,
              status: 'pending'
            }
          }
        },
        {
          $set: {
            'schedule_driving_test.$.status': 'booked',
            'schedule_driving_test.$.paid': true,
            'schedule_driving_test.$.paymentId': paymentId,
            'schedule_driving_test.$.confirmedAt': new Date()
          }
        }
      );

      const totalUpdated = drivingLessonResult.modifiedCount + drivingTestResult.modifiedCount;
      console.log(`✅ Payment confirmed: ${drivingLessonResult.modifiedCount} driving lessons + ${drivingTestResult.modifiedCount} driving tests updated`);

      return NextResponse.json({
        success: true,
        message: 'Payment confirmed and slots booked',
        slotsUpdated: totalUpdated,
        drivingLessons: drivingLessonResult.modifiedCount,
        drivingTests: drivingTestResult.modifiedCount
      });

    } else if (paymentStatus === 'failed' || paymentStatus === 'cancelled') {
      // Revert pending driving lesson slots back to available
      const drivingLessonResult = await User.updateMany(
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

      // Revert pending driving test slots back to available
      const drivingTestResult = await User.updateMany(
        {
          role: 'instructor',
          'schedule_driving_test': {
            $elemMatch: {
              studentId: userId,
              selectedProduct: productId,
              status: 'pending'
            }
          }
        },
        {
          $set: {
            'schedule_driving_test.$.status': 'available',
            'schedule_driving_test.$.studentId': null,
            'schedule_driving_test.$.selectedProduct': null,
            'schedule_driving_test.$.pickupLocation': null,
            'schedule_driving_test.$.dropOffLocation': null,
            'schedule_driving_test.$.paymentMethod': null,
            'schedule_driving_test.$.requestDate': null,
            'schedule_driving_test.$.paid': false
          }
        }
      );

      const totalReverted = drivingLessonResult.modifiedCount + drivingTestResult.modifiedCount;
      console.log(`❌ Payment failed/cancelled: ${drivingLessonResult.modifiedCount} driving lessons + ${drivingTestResult.modifiedCount} driving tests reverted`);

      return NextResponse.json({
        success: true,
        message: 'Payment failed, slots returned to available',
        slotsUpdated: totalReverted,
        drivingLessons: drivingLessonResult.modifiedCount,
        drivingTests: drivingTestResult.modifiedCount
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
