import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/User';
import { connectDB } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import AuthCode from '@/models/AuthCode';

export async function POST(req: NextRequest) {
  await connectDB();
  const data = await req.json();
  const { code, email } = data;
  if (!code || !email) {
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
  // Hashear la contraseña
  const hashedPassword = await bcrypt.hash(data.password, 10);
  // Formatear birthDate a 'YYYY-MM-DD' como string
  let birthDate: string | undefined = undefined;
  if (data.birthDate) {
    const d = new Date(data.birthDate);
    birthDate = d.toISOString().split('T')[0];
    if (isNaN(Date.parse(data.birthDate))) {
      return NextResponse.json({ error: 'Invalid birth date format' }, { status: 400 });
    }
  }
  // Crear usuario
  const userData = {
    firstName: data.firstName,
    middleName: data.middleName,
    lastName: data.lastName,
    email: data.email,
    dni: data.dni,
    ssnLast4: data.ssnLast4,
    hasLicense: data.hasLicense === true || data.hasLicense === 'true',
    licenseNumber: data.licenseNumber,
    birthDate: birthDate,
    streetAddress: data.streetAddress,
    apartmentNumber: data.apartmentNumber,
    city: data.city,
    state: data.state,
    zipCode: data.zipCode,
    phoneNumber: data.phoneNumber,
    sex: data.sex === 'M' || data.sex === 'F' ? data.sex : (data.sex === 'Male' ? 'M' : 'F'),
    howDidYouHear: 'Online Ad',
    role: 'user',
    password: hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date(),
    privateNotes: "",
  };
  try {
    const user = await User.create(userData);
    return NextResponse.json({ success: true, user });
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Error saving user', details: error instanceof Error ? error.message : JSON.stringify(error) }, { status: 400 });
  }
} 