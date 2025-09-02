import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Instructor from "@/models/Instructor";

// Fixed: Removed invalid import that was causing build errors
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    console.log('🛒 Adding driving lesson package to cart:', body);

    const {
      userId,
      packageDetails,
      selectedSlots,
      instructorData
    } = body;

    // Validation
    if (!userId || !packageDetails || !selectedSlots || selectedSlots.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
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

    // Step 1: Mark slots as pending in instructors collection
    console.log('🔄 Marking slots as pending in instructors...');
    console.log('📋 Selected slots to update:', selectedSlots);
    
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
        console.log(`🔍 Processing slot: ${slotKey} -> date: ${date}, start: ${start}, end: ${end}`);
       
                       // Find which instructor has this slot in the database (available or pending)
        const instructor = await Instructor.findOne({
          'schedule_driving_lesson': {
            $elemMatch: {
              date: date,
              start: start,
              end: end,
              status: { $in: ['available', 'pending'] }
            }
          }
        });

        if (!instructor) {
          console.warn(`❌ No instructor found for slot: ${slotKey}`);
          return null;
        }

        const instructorId = instructor._id;
        console.log(`✅ Found instructor ${instructor.name} (${instructorId}) for slot ${slotKey}`);

      console.log(`🔄 Updating slot ${slotKey} for instructor ${instructorId}`);

              // Update the specific slot to pending (regardless of current status)
        const updateResult = await Instructor.updateOne(
          {
            _id: instructorId,
            'schedule_driving_lesson': {
              $elemMatch: {
                date: date,
                start: start,
                end: end,
                status: { $in: ['available', 'pending'] }
              }
            }
          },
          {
            $set: {
              'schedule_driving_lesson.$.status': 'pending',
              'schedule_driving_lesson.$.studentId': userId,
              'schedule_driving_lesson.$.studentName': user.name || 'Pending Student',
              'schedule_driving_lesson.$.reservedAt': new Date(),
              'schedule_driving_lesson.$.pickupLocation': packageDetails.pickupLocation,
              'schedule_driving_lesson.$.dropoffLocation': packageDetails.dropoffLocation
            }
          }
        );
        
        console.log(`🔄 MongoDB Update Query:`, JSON.stringify({
          _id: instructorId,
          'schedule_driving_lesson': {
            $elemMatch: {
              date: date,
              start: start,
              end: end,
              status: { $in: ['available', 'pending'] }
            }
          }
        }, null, 2));

      console.log(`✅ Slot ${slotKey} update result:`, updateResult.modifiedCount > 0 ? 'SUCCESS' : 'NO CHANGES');
      console.log(`📊 Update details: matchedCount: ${updateResult.matchedCount}, modifiedCount: ${updateResult.modifiedCount}`);
      return updateResult;
    });

    await Promise.all(slotUpdatePromises);
    console.log('✅ All slots marked as pending in instructors');

    // SSE updates are handled automatically by MongoDB Change Streams
    console.log('📡 SSE updates will be sent automatically via MongoDB Change Streams');

    // Step 2: Add to user's cart
    const cartItem = {
      id: packageDetails.productId,
      title: packageDetails.packageTitle,
      price: packageDetails.packagePrice,
      quantity: 1,
      packageDetails,
      selectedSlots,
      instructorData, // Include instructor data for checkout
      addedAt: new Date()
    };

    // Check if this package is already in cart
    const existingCartItem = user.cart?.find((item: any) => 
      item.id === packageDetails.productId && 
      item.packageDetails?.productId === packageDetails.productId
    );

    if (existingCartItem) {
      return NextResponse.json(
        { error: "This package is already in your cart" },
        { status: 400 }
      );
    }

    // Add to cart
    if (!user.cart) {
      user.cart = [];
    }
    user.cart.push(cartItem);
    
    console.log('🔄 Saving cart to database...');
    console.log('🔄 Cart items before save:', user.cart.length);
    console.log('🔄 Cart item to save:', cartItem);
    
    await user.save();
    
    // Verify the save worked
    const savedUser = await User.findById(userId);
    console.log('🔄 Cart items after save:', savedUser?.cart?.length || 0);
    console.log('✅ Package added to cart successfully');

    return NextResponse.json({
      success: true,
      message: "Driving lesson package added to cart and slots marked as pending",
      cartItem: cartItem
    });

  } catch (error) {
    console.error("❌ Error adding driving lesson package to cart:", error);
    return NextResponse.json(
      { error: "Failed to add package to cart", details: error.message },
      { status: 500 }
    );
  }
}
