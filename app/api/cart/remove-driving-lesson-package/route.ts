import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Instructor from "@/models/Instructor";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    console.log('🗑️ Removing driving lesson package from cart:', body);

    const { userId, itemId, selectedSlots, slotDetails } = body;

    // Validation
    if (!userId || !itemId) {
      return NextResponse.json(
        { error: "Missing required fields: userId, itemId" },
        { status: 400 }
      );
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Step 1: Free up slots in instructors collection (mark as available)
    // Use slotDetails if available for targeted updates, fallback to selectedSlots
    if (slotDetails && slotDetails.length > 0) {
      console.log('🔄 Freeing up slots using slotDetails (targeted approach)...');
      console.log(`📋 Processing ${slotDetails.length} slots with instructor information`);

      const slotUpdatePromises = slotDetails.map(async (slotDetail: {
        slotKey: string;
        instructorId: string;
        instructorName: string;
        date: string;
        start: string;
        end: string;
      }) => {
        console.log(`🔄 Freeing slot ${slotDetail.slotKey} for instructor ${slotDetail.instructorName} (${slotDetail.instructorId})`);

        // Target specific instructor by ID - this ensures we update the right instructor
        const updateResult = await Instructor.updateOne(
          {
            _id: slotDetail.instructorId, // TARGET SPECIFIC INSTRUCTOR
            'schedule_driving_lesson': {
              $elemMatch: {
                date: slotDetail.date,
                start: slotDetail.start,
                end: slotDetail.end,
                status: 'pending', // ONLY free pending slots
                studentId: userId,
                paid: { $ne: true } // ONLY free unpaid slots
              }
            }
          },
          {
            $set: {
              'schedule_driving_lesson.$.status': 'available',
              'schedule_driving_lesson.$.classType': 'driving lesson',
              'schedule_driving_lesson.$.pickupLocation': '',
              'schedule_driving_lesson.$.dropoffLocation': '',
              'schedule_driving_lesson.$.selectedProduct': '',
              'schedule_driving_lesson.$.studentId': null,
              'schedule_driving_lesson.$.studentName': null,
              'schedule_driving_lesson.$.paid': false
            },
            $unset: {
              'schedule_driving_lesson.$.reservedAt': '',
              'schedule_driving_lesson.$.paymentMethod': '',
              'schedule_driving_lesson.$.booked': '',
              'schedule_driving_lesson.$.orderId': '',
              'schedule_driving_lesson.$.orderNumber': ''
            }
          }
        );

        console.log(`✅ Slot ${slotDetail.slotKey} freed:`, updateResult.modifiedCount > 0 ? 'SUCCESS' : 'NO CHANGES (already booked/paid)');
        console.log(`📊 Update details: matchedCount: ${updateResult.matchedCount}, modifiedCount: ${updateResult.modifiedCount}`);
        return updateResult;
      });

      await Promise.all(slotUpdatePromises);
      console.log('✅ All slots freed using targeted instructor updates');
    } else if (selectedSlots && selectedSlots.length > 0) {
      // Fallback to old logic for backwards compatibility
      console.log('🔄 Freeing up slots using selectedSlots (fallback approach)...');
      console.log('⚠️ Consider passing slotDetails for better reliability');

      const slotUpdatePromises = selectedSlots.map(async (slotKey: string) => {
        // Fix the slot parsing - slots are in format "2025-09-25-14:30-16:30" (5 parts)
        const parts = slotKey.split('-');
        const date = `${parts[0]}-${parts[1]}-${parts[2]}`; // 2025-09-25
        const start = parts[3]; // 14:30
        const end = parts[4]; // 16:30

        // Validate parsing
        if (!parts[3] || !parts[4]) {
          console.error(`❌ Invalid slot format: ${slotKey} - parts:`, parts);
          return null;
        }

        console.log(`🔍 Parsed slot: date=${date}, start=${start}, end=${end}`);
        console.log(`🔍 Raw slotKey: "${slotKey}"`);
        console.log(`🔍 Split parts:`, parts);
        console.log(`🔄 Freeing slot ${slotKey} -> date: ${date}, start: ${start}, end: ${end}`);

        // Update the specific slot back to available ONLY if it's still pending (not booked/paid)
        const updateResult = await Instructor.updateOne(
          {
            'schedule_driving_lesson.date': date,
            'schedule_driving_lesson.start': start,
            'schedule_driving_lesson.end': end,
            'schedule_driving_lesson.status': 'pending', // ONLY free pending slots
            'schedule_driving_lesson.studentId': userId,
            'schedule_driving_lesson.paid': { $ne: true } // ONLY free unpaid slots
          },
          {
            $set: {
              'schedule_driving_lesson.$.status': 'available',
              'schedule_driving_lesson.$.classType': 'driving lesson',
              'schedule_driving_lesson.$.pickupLocation': '',
              'schedule_driving_lesson.$.dropoffLocation': '',
              'schedule_driving_lesson.$.selectedProduct': '',
              'schedule_driving_lesson.$.studentId': null,
              'schedule_driving_lesson.$.studentName': null,
              'schedule_driving_lesson.$.paid': false
            },
            $unset: {
              'schedule_driving_lesson.$.reservedAt': '',
              'schedule_driving_lesson.$.paymentMethod': '',
              'schedule_driving_lesson.$.booked': '',
              'schedule_driving_lesson.$.orderId': '',
              'schedule_driving_lesson.$.orderNumber': ''
            }
          }
        );

        console.log(`✅ Slot ${slotKey} freed:`, updateResult.modifiedCount > 0 ? 'SUCCESS' : 'NO CHANGES (already booked/paid)');
        console.log(`📊 Update details: matchedCount: ${updateResult.matchedCount}, modifiedCount: ${updateResult.modifiedCount}`);
        return updateResult;
      });

      await Promise.all(slotUpdatePromises);
      console.log('✅ All slots freed and marked as available');
    }

    // Step 2: Remove from user's cart using findByIdAndUpdate
    if (user.cart) {
      const filteredCart = user.cart.filter((item: { id: string }) => item.id !== itemId);
      await User.findByIdAndUpdate(userId, { cart: filteredCart }, { runValidators: false });
      console.log('✅ Package removed from cart successfully');
    }

    return NextResponse.json({
      success: true,
      message: "Driving lesson package removed from cart and slots freed up"
    });

  } catch (error) {
    console.error("❌ Error removing driving lesson package from cart:", error);
    return NextResponse.json(
      { error: "Failed to remove package from cart", details: error.message },
      { status: 500 }
    );
  }
}
