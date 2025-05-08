import { NextResponse } from 'next/server';
import User from '@/models/User';
import { connectDB } from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET(req: Request, context: any) {
  await connectDB();
  const params = await context.params;
  const id = params.id;
  let user = null;
  // Try to find by ObjectId and by string
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

export async function PUT(req: Request, context: any) {
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