import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    
    const { userId, classReminder, drivingTestReminder } = await request.json();
    
    console.log("PUT request data:", { userId, classReminder, drivingTestReminder });
    
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Actualizar solo los campos de recordatorio si se proporcionan
    const updateData: any = {};
    
    if (typeof classReminder === 'boolean') {
      updateData.classReminder = classReminder;
    }
    
    if (typeof drivingTestReminder === 'boolean') {
      updateData.drivingTestReminder = drivingTestReminder;
    }

    console.log("Update data:", updateData);

    // Primero buscar el usuario para verificar que existe
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      console.log("User not found with ID:", userId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("User found:", existingUser.email);

    // Actualizar usando $set para asegurar que los campos se crean
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, upsert: false }
    );

    console.log("Updated user preferences:", {
      email: updatedUser.email,
      classReminder: updatedUser.classReminder,
      drivingTestReminder: updatedUser.drivingTestReminder
    });

    return NextResponse.json({ 
      message: "Preferences updated successfully",
      user: {
        _id: updatedUser._id,
        email: updatedUser.email,
        classReminder: updatedUser.classReminder,
        drivingTestReminder: updatedUser.drivingTestReminder
      }
    });

  } catch (error) {
    console.error("Error updating user preferences:", error);
    return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    console.log("GET request for userId:", userId);
    
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const user = await User.findById(userId).select('email classReminder drivingTestReminder');
    
    if (!user) {
      console.log("User not found with ID:", userId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("User preferences found:", {
      email: user.email,
      classReminder: user.classReminder,
      drivingTestReminder: user.drivingTestReminder
    });

    return NextResponse.json({ 
      classReminder: user.classReminder || false,
      drivingTestReminder: user.drivingTestReminder || false
    });

  } catch (error) {
    console.error("Error fetching user preferences:", error);
    return NextResponse.json({ error: "Failed to fetch preferences" }, { status: 500 });
  }
} 