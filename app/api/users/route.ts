import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/User';
import { connectDB } from '@/lib/mongodb';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Handler para crear usuario (POST)
export async function POST(req: Request) {
  await connectDB();
  const data = await req.json();
  console.log("Nuevo usuario recibido:", data);

  // Validar campos requeridos
  const requiredFields = [
    "firstName", "middleName", "lastName", "email", "dni", "ssnLast4", "hasLicense",
    "birthDate", "streetAddress", "city", "state", "zipCode", "phoneNumber", "sex", "password"
  ];
  for (const field of requiredFields) {
    if (!data[field] && data[field] !== false) {
      return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
    }
  }

  // Hashear la contraseña
  const hashedPassword = await bcrypt.hash(data.password, 10);

  // Formatear birthDate a 'YYYY-MM-DD' como string
  let birthDate: string | undefined = undefined;
  if (data.birthDate) {
    const d = new Date(data.birthDate);
    birthDate = d.toISOString().split('T')[0]; // 'YYYY-MM-DD'
    // Validar que la fecha sea válida
    if (isNaN(Date.parse(data.birthDate))) {
      return NextResponse.json({ error: 'Invalid birth date format' }, { status: 400 });
    }
  }

  // Orden y campos igual a 'Santiago'
  const userData = {
    firstName: data.firstName,
    middleName: data.middleName,
    lastName: data.lastName,
    email: data.email,
    dni: data.dni,
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
    password: hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date(),
    privateNotes: "",
  };

  try {
    const user = await User.create(userData);
    return NextResponse.json(user);
  } catch (error: unknown) {
    console.error("Error al guardar usuario:", error);
    return NextResponse.json({ 
      error: 'Error saving user', 
      details: error instanceof Error ? error.message : JSON.stringify(error)
    }, { status: 400 });
  }
}

// Handler para obtener usuario por ID usando query param (?id=123)
export const GET = async (
  req: NextRequest
): Promise<NextResponse> => {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('id');
    if (!userId) {
      return NextResponse.json({ error: 'Missing id query param' }, { status: 400 });
    }
    let user = mongoose.Types.ObjectId.isValid(userId)
      ? await User.findById(userId).lean()
      : null;
    if (!user) {
      user = await User.findOne({ authId: userId }).lean();
    }
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error al buscar usuario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
};

// Handler para actualizar usuario por ID usando query param (?id=123)
export const PUT = async (
  req: NextRequest
): Promise<NextResponse> => {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('id');
    if (!userId) {
      return NextResponse.json({ error: 'Missing id query param' }, { status: 400 });
    }
    const { note } = await req.json();
    const user = await User.findByIdAndUpdate(
      userId,
      { privateNotes: note },
      { new: true }
    ).lean();
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}; 