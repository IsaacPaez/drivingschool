import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/User';
import { connectDB } from '@/lib/mongodb';
import mongoose from 'mongoose';

type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(
  req: NextRequest,
  { params }: RouteContext
) {
  try {
    await connectDB();
    const userId = params.id;
    
    // Intentar encontrar el usuario por ObjectId
    let user = mongoose.Types.ObjectId.isValid(userId) 
      ? await User.findById(userId).lean()
      : null;
    
    // Si no se encontró, buscar por authId
    if (!user) {
      user = await User.findOne({ authId: userId }).lean();
    }
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error al buscar usuario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: RouteContext
) {
  try {
    await connectDB();
    const userId = params.id;
    const { note } = await req.json();
    
    const user = await User.findByIdAndUpdate(
      userId,
      { privateNotes: note },
      { new: true }
    ).lean();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 