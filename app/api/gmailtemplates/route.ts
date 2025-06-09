import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import GmailTemplate from '@/models/gmailtemplate';

export async function GET(request: Request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'student';
  const templates = await GmailTemplate.find({ type }).lean();
  return NextResponse.json({ templates });
} 