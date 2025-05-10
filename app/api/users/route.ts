import { NextResponse } from 'next/server';
import User from '@/models/User';
import { connectDB } from '@/lib/mongodb';

export async function POST(req: Request) {
  await connectDB();
  const data = await req.json();

  // Formatear birthDate a 'YYYY-MM-DD' como string
  let birthDate = undefined;
  if (data.birthDate) {
    const d = new Date(data.birthDate);
    birthDate = d.toISOString().split('T')[0]; // 'YYYY-MM-DD'
  }

  // Orden y campos igual a 'Santiago'
  const userData = {
    firstName: data.firstName,
    middleName: data.middleName,
    lastName: data.lastName,
    email: data.email,
    ssnLast4: data.ssnLast4,
    hasLicense: data.hasLicense === true || data.hasLicense === 'true',
    licenseNumber: data.licenseNumber,
    birthDate: birthDate, // string 'YYYY-MM-DD'
    streetAddress: data.streetAddress,
    apartmentNumber: data.apartmentNumber,
    city: data.city,
    state: data.state,
    zipCode: data.zipCode,
    phoneNumber: data.phoneNumber,
    sex: data.sex === 'M' || data.sex === 'F' ? data.sex : (data.sex === 'Male' ? 'M' : 'F'),
    howDidYouHear: 'Online Ad',
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    const user = await User.create(userData);
    return NextResponse.json(user);
  } catch (err: any) {
    return NextResponse.json({ error: 'Error saving user', details: err.message }, { status: 400 });
  }
} 