import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Instructor from "@/models/Instructor";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    let userId;
    try {
      const body = await req.json();
      userId = body.userId;
    } catch (jsonError) {
      console.error("❌ Error parsing JSON:", jsonError);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400 }
      );
    }

    console.log("🧹 Clearing user cart for user:", userId);

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Clear driving test items from user.cart and free their slots
    if (user.cart && user.cart.length > 0) {
      console.log(`🗑️ Found ${user.cart.length} items in user cart, freeing slots...`);

      // Process each item to free its slots based on class type
      for (const item of user.cart) {
        if (item.instructorId) {
          try {
            // Find the instructor
            const instructor = await Instructor.findById(item.instructorId);
            if (!instructor) {
              console.warn(`⚠️ Instructor not found for item: ${item.id}`);
              continue;
            }

            // Handle different class types
            if (item.classType === 'driving test' && instructor.schedule_driving_test) {
              console.log(`🔍 Looking for driving test slot: ${item.date} ${item.start}-${item.end}`);
              console.log(`🔍 Instructor has ${instructor.schedule_driving_test.length} driving test slots`);

              // Free driving test slots - look for slots that match the cart item
              const matchingSlots = instructor.schedule_driving_test.filter((s: { date?: string; start?: string; end?: string; status?: string; studentId?: string }) => {
                const matches = s.date === item.date &&
                  s.start === item.start &&
                  s.end === item.end;
                console.log(`🔍 Slot ${s.date} ${s.start}-${s.end} (status: ${s.status}, studentId: ${s.studentId}) matches: ${matches}`);
                return matches;
              });

              console.log(`🔍 Found ${matchingSlots.length} matching slots`);

              // Find the slot that belongs to this user (pending or booked)
              const slot = matchingSlots.find((s: { status?: string; studentId?: string }) =>
                s.status === 'pending' || s.status === 'booked' || s.status === 'scheduled'
              ) || matchingSlots[0];

              if (slot) {
                console.log(`🔍 Found slot to free: ${slot.date} ${slot.start}-${slot.end} (status: ${slot.status})`);

                // Force the slot back to available
                (slot as Record<string, unknown>).status = 'available';
                (slot as Record<string, unknown>).studentId = null;
                (slot as Record<string, unknown>).studentName = null;
                (slot as Record<string, unknown>).paid = false;

                // Clean up driving test specific fields
                delete (slot as Record<string, unknown>).booked;
                delete (slot as Record<string, unknown>).reservedAt;
                delete (slot as Record<string, unknown>).paymentMethod;
                delete (slot as Record<string, unknown>).orderId;
                delete (slot as Record<string, unknown>).orderNumber;
                console.log(`✅ Freed driving test slot: ${item.date} ${item.start}-${item.end} -> status: available`);
              } else {
                console.warn(`⚠️ No slot found to free for driving test: ${item.date} ${item.start}-${item.end}`);
              }
            } else if (item.classType === 'driving lesson' && instructor.schedule_driving_lesson) {
              // Free driving lesson slots - use slotDetails if available for targeted updates
              if (item.slotDetails && Array.isArray(item.slotDetails) && item.slotDetails.length > 0) {
                console.log(`🔍 Using slotDetails for driving lesson slot: ${item.date} ${item.start}-${item.end}`);
                // Use slotDetails for precise targeting (this should match what's in the cart)
                const slotDetail = item.slotDetails.find((sd: { date?: string; start?: string; end?: string }) =>
                  sd.date === item.date && sd.start === item.start && sd.end === item.end
                );

                if (slotDetail) {
                  console.log(`🎯 Found slotDetails for instructor ${slotDetail.instructorName} (${slotDetail.instructorId})`);
                  // Double check we're updating the right instructor
                  if (slotDetail.instructorId === instructor._id.toString()) {
                    const matchingSlots = instructor.schedule_driving_lesson.filter((s: { date?: string; start?: string; end?: string; status?: string }) =>
                      s.date === item.date &&
                      s.start === item.start &&
                      s.end === item.end
                    );

                    const slot = matchingSlots.find((s: { status?: string }) => s.status !== 'cancelled') || matchingSlots[0];

                    if (slot) {
                      (slot as Record<string, unknown>).status = 'available';
                      (slot as Record<string, unknown>).studentId = null;
                      (slot as Record<string, unknown>).studentName = null;
                      (slot as Record<string, unknown>).paid = false;

                      // Clean up driving lesson specific fields
                      delete (slot as Record<string, unknown>).booked;
                      delete (slot as Record<string, unknown>).reservedAt;
                      delete (slot as Record<string, unknown>).paymentMethod;
                      delete (slot as Record<string, unknown>).orderId;
                      delete (slot as Record<string, unknown>).orderNumber;
                      delete (slot as Record<string, unknown>).pickupLocation;
                      delete (slot as Record<string, unknown>).dropoffLocation;
                      delete (slot as Record<string, unknown>).selectedProduct;
                      console.log(`✅ Freed driving lesson slot using slotDetails: ${item.date} ${item.start}-${item.end}`);
                    } else {
                      console.warn(`⚠️ No slot found to free for driving lesson: ${item.date} ${item.start}-${item.end}`);
                    }
                  } else {
                    console.warn(`⚠️ Instructor mismatch: expected ${slotDetail.instructorId}, got ${instructor._id.toString()}`);
                  }
                } else {
                  console.warn(`⚠️ No matching slotDetail found for ${item.date} ${item.start}-${item.end}`);
                }
              } else {
                // Fallback to old logic if slotDetails not available
                console.log(`🔍 No slotDetails available, using fallback for driving lesson slot: ${item.date} ${item.start}-${item.end}`);
                const matchingSlots = instructor.schedule_driving_lesson.filter((s: { date?: string; start?: string; end?: string; status?: string }) =>
                  s.date === item.date &&
                  s.start === item.start &&
                  s.end === item.end
                );

                const slot = matchingSlots.find((s: { status?: string }) => s.status !== 'cancelled') || matchingSlots[0];

                if (slot) {
                  (slot as Record<string, unknown>).status = 'available';
                  (slot as Record<string, unknown>).studentId = null;
                  (slot as Record<string, unknown>).studentName = null;
                  (slot as Record<string, unknown>).paid = false;

                  // Clean up driving lesson specific fields
                  delete (slot as Record<string, unknown>).booked;
                  delete (slot as Record<string, unknown>).reservedAt;
                  delete (slot as Record<string, unknown>).paymentMethod;
                  delete (slot as Record<string, unknown>).orderId;
                  delete (slot as Record<string, unknown>).orderNumber;
                  delete (slot as Record<string, unknown>).pickupLocation;
                  delete (slot as Record<string, unknown>).dropoffLocation;
                  delete (slot as Record<string, unknown>).selectedProduct;
                  console.log(`✅ Freed driving lesson slot (fallback): ${item.date} ${item.start}-${item.end}`);
                }
              }
            } else if (item.classType === 'ticket' && instructor.schedule) {
              // Free ticket class slots
              const matchingSlots = instructor.schedule.filter((s: { date?: string; start?: string; end?: string; status?: string }) =>
                s.date === item.date &&
                s.start === item.start &&
                s.end === item.end
              );

              const slot = matchingSlots.find((s: { status?: string }) => s.status !== 'cancelled') || matchingSlots[0];

              if (slot) {
                (slot as Record<string, unknown>).status = 'available';
                (slot as Record<string, unknown>).studentId = null;
                (slot as Record<string, unknown>).studentName = null;
                (slot as Record<string, unknown>).paid = false;

                // Clean up ticket class specific fields
                delete (slot as Record<string, unknown>).booked;
                delete (slot as Record<string, unknown>).reservedAt;
                delete (slot as Record<string, unknown>).paymentMethod;
                delete (slot as Record<string, unknown>).orderId;
                delete (slot as Record<string, unknown>).orderNumber;
                console.log(`✅ Freed ticket class slot: ${item.date} ${item.start}-${item.end}`);
              }
            }

            await instructor.save();
          } catch (error) {
            console.warn(`⚠️ Failed to free slot for item ${item.id}:`, error);
          }
        } else {
          console.log(`ℹ️ Item ${item.id} has no instructorId, skipping slot freeing`);
        }
      }

      // Clear the user's cart using findByIdAndUpdate
      await User.findByIdAndUpdate(userId, { cart: [] }, { runValidators: false });
      console.log("✅ User cart cleared and slots freed");
    } else {
      console.log("ℹ️ User cart is already empty");
    }

    return NextResponse.json({
      success: true,
      message: "User cart cleared successfully",
      freedSlots: user.cart?.length || 0
    });

  } catch (error) {
    console.error("❌ Error clearing user cart:", error);
    return NextResponse.json(
      { error: "Failed to clear user cart", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
