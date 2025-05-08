import { NextResponse } from 'next/server';
import Note from '@/models/Note';
import { connectDB } from '@/lib/mongodb';
import mongoose from 'mongoose';

// GET /api/notes?studentId=...&instructorId=...
export async function GET(req: Request) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('studentId');
  const instructorId = searchParams.get('instructorId');
  if (!studentId || !instructorId) {
    return NextResponse.json({ error: 'studentId and instructorId required' }, { status: 400 });
  }
  const noteDoc = await Note.findOne({ studentId, instructorId }).lean();
  return NextResponse.json(noteDoc || { notes: [] });
}

// POST /api/notes
// Body: { studentId, instructorId, text }
export async function POST(req: Request) {
  await connectDB();
  const { studentId, instructorId, text } = await req.json();
  if (!studentId || !instructorId || !text) {
    return NextResponse.json({ error: 'studentId, instructorId, and text required' }, { status: 400 });
  }
  const noteEntry = { text, date: new Date() };
  const noteDoc = await Note.findOneAndUpdate(
    { studentId, instructorId },
    { $push: { notes: noteEntry } },
    { upsert: true, new: true }
  ).lean();
  return NextResponse.json(noteDoc);
} 