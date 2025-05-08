import { NextResponse } from 'next/server';
import User from '@/models/User';
import { connectDB } from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET(req: Request, context: { params: { id: string } }) {
  await connectDB();
  const { id } = context.params;
  let user = null;
  // Intentar buscar por ObjectId y por string
  if (mongoose.Types.ObjectId.isValid(id)) {
    user = await User.findById(id).lean();
  }
  if (!user) {
    user = await User.findOne({ _id: id }).lean();
  }
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  return NextResponse.json(user);
}

export async function PUT(req: Request, context: { params: { id: string } }) {
  await connectDB();
  const { id } = context.params;
  const { note } = await req.json();
  const user = await User.findByIdAndUpdate(id, { privateNotes: note }, { new: true }).lean();
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  return NextResponse.json(user);
} 