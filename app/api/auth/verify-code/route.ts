import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/User';
import Instructor from '@/models/Instructor';
import { connectDB } from '@/lib/mongodb';  
import AuthCode from '@/models/AuthCode';

const codeStore: Record<string, { code: string; expires: number }> = globalThis._codeStore || (globalThis._codeStore = {});

export async function POST(req: NextRequest) {
  await connectDB();
  const { email, code } = await req.json();
  if (!email || !code) {
    return NextResponse.json({ error: 'Email and code are required.' }, { status: 400 });
  }
  // Buscar el código en la base de datos
  const codeDoc = await AuthCode.findOne({ email: email.trim().toLowerCase(), code, used: false });
  if (!codeDoc) {
    return NextResponse.json({ error: 'Invalid or expired code.' }, { status: 401 });
  }
  if (codeDoc.expires < new Date()) {
    await AuthCode.deleteOne({ _id: codeDoc._id });
    return NextResponse.json({ error: 'Code expired. Please request a new one.' }, { status: 401 });
  }
  // Eliminar el código después de usarse
  await AuthCode.deleteOne({ _id: codeDoc._id });
  // Buscar primero en instructores
  let user = await Instructor.findOne({ email });
  if (user) {
    return NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        instructorId: user._id,
        name: user.name,
        email: user.email,
        photo: user.photo || null,
        type: 'instructor',
      },
    });
  }
  // Si no es instructor, buscar en usuarios normales
  user = await User.findOne({ email });
  if (user) {
    return NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        name: user.firstName + (user.lastName ? ' ' + user.lastName : ''),
        email: user.email,
        photo: user.photo || null,
        type: 'user',
      },
    });
  }
  return NextResponse.json({ error: 'User not found.' }, { status: 404 });
} 