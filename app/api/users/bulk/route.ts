import { NextResponse } from 'next/server';
import User from '@/models/User';
import { connectDB } from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function POST(req: Request) {
  await connectDB();
  const { ids } = await req.json();
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json([], { status: 200 });
  }
  // Convertir a ObjectId si es válido, si no dejar como string
  const objectIds = ids.map(id => mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id);
  const users = await User.find({ _id: { $in: objectIds } }).lean();
  return NextResponse.json(users);
} 