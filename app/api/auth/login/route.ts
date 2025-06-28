import { NextRequest, NextResponse } from 'next/server';
import Instructor from '@/models/Instructor';
import User from '@/models/User';
import { connectDB } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import AuthCode from '@/models/AuthCode';

// Guardar códigos temporalmente en memoria (en producción usar Redis o DB)
const codeStore: Record<string, { code: string; expires: number }> = globalThis._codeStore || (globalThis._codeStore = {});

export async function POST(req: NextRequest) {
  await connectDB();
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  // 1. Buscar en instructores
  const instructor = await Instructor.findOne({ email });
  if (instructor) {
    const valid = await bcrypt.compare(password, instructor.password);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }
    // Login exitoso para instructor (sin 2FA)
    return NextResponse.json({ success: true, type: 'instructor', user: {
      _id: instructor._id,
      name: instructor.name,
      email: instructor.email,
      photo: instructor.photo || null,
      type: 'instructor',
    }});
  }

  // 2. Buscar en users
  const user = await User.findOne({ email });
  if (user) {
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }
    // Login exitoso para usuario normal (sin 2FA)
    return NextResponse.json({ success: true, type: 'user', user: {
      _id: user._id,
      name: user.firstName + (user.lastName ? ' ' + user.lastName : ''),
      email: user.email,
      photo: user.photo || null,
      type: 'user',
    }});
  }

  return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
} 