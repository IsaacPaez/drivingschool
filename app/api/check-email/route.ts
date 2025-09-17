import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/User';
import Instructor from '@/models/Instructor';
import { connectDB } from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Verificar en la colección de usuarios
    const userExists = await User.findOne({ email: email.trim().toLowerCase() });
    
    // Verificar en la colección de instructores
    const instructorExists = await Instructor.findOne({ email: email.trim().toLowerCase() });
    
    const exists = userExists || instructorExists;
    
    return NextResponse.json({ exists: !!exists });
  } catch {
    return NextResponse.json({ exists: false });
  }
}