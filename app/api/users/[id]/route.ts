import { NextResponse } from 'next/server';
import User from '@/models/User';
import { connectDB } from '@/lib/mongodb';
import mongoose from 'mongoose';

interface RouteContext {
  params: {
    id: string;
  };
}

export async function GET(req: Request, context: RouteContext) {
  await connectDB();
  const params = await context.params;
  const id = params.id;
  let user = null;
  // Buscar por ObjectId si es válido
  if (mongoose.Types.ObjectId.isValid(id)) {
    user = await User.findById(id).lean();
  }
  // Si no se encontró, buscar por authId (para usuarios de Google/Auth0)
  if (!user) {
    user = await User.findOne({ authId: id }).lean();
  }
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  return NextResponse.json(user);
}

export async function PUT(req: Request, context: RouteContext) {
  await connectDB();
  const params = await context.params;
  const id = params.id;
  const { note } = await req.json();
  const user = await User.findByIdAndUpdate(id, { privateNotes: note }, { new: true }).lean();
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  return NextResponse.json(user);
} 