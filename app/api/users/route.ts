import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/User';
import { connectDB } from '@/lib/mongodb';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import AuthCode from '@/models/AuthCode';

// Handler para crear usuario (POST)
export async function POST(req: Request) {
  await connectDB();
  const data = await req.json();
  //console.log("Nuevo usuario recibido:", data);

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

  // Verifica si el email ya está registrado
  const exists = await User.findOne({ email: data.email });
  if (exists) {
    return NextResponse.json({ error: 'Email already registered.' }, { status: 400 });
  }

  // Genera y almacena el código
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  await AuthCode.deleteMany({ email: data.email.trim().toLowerCase(), used: false });
  await AuthCode.create({
    email: data.email.trim().toLowerCase(),
    code,
    expires: new Date(Date.now() + 10 * 60 * 1000),
    used: false,
  });

  // Enviar correo (usa la plantilla del login)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  const logoUrl = "https://res.cloudinary.com/dzi2p0pqa/image/upload/v1739549973/sxsfccyjjnvmxtzlkjpi.png";
  const html = `
    <div style="background: #f6f8fa; padding: 0; min-height: 100vh;">
      <div style="max-width: 600px; margin: 40px auto; background: #fff; border-radius: 18px; box-shadow: 0 4px 24px rgba(0,0,0,0.07); overflow: hidden;">
        <div style="background: #2346a0; padding: 32px 0 24px 0; text-align: center;">
          <img src="${logoUrl}" alt="Logo" width="80" style="margin-bottom: 12px;" />
          <h1 style="color: #fff; font-size: 2rem; margin: 0; font-family: Arial, sans-serif; letter-spacing: 1px;">
            Driving School Notification
          </h1>
        </div>
        <div style="padding: 36px 32px 24px 32px; font-family: Arial, sans-serif; color: #222;">
          <h2 style="color: #0056b3; margin-top: 0;">Hello, <b>${data.firstName?.toUpperCase() || 'User'}</b>!</h2>
          <div style="font-size: 1.1rem; margin-bottom: 32px; line-height: 1.7; text-align: center;">
            <div style="font-size: 1.2rem; margin-bottom: 12px;">Your verification code is:</div>
            <div style="font-size: 2.5rem; font-weight: bold; color: #2346a0; background: #f0f6ff; border-radius: 12px; padding: 18px 0; letter-spacing: 8px; margin: 0 auto; max-width: 220px;">${code}</div>
            <div style="margin-top: 18px; color: #888; font-size: 1rem;">This code will expire in 10 minutes.</div>
          </div>
        </div>
        <div style="background: linear-gradient(135deg, #0056b3, #000); color: white; padding: 32px 24px; border-radius: 0 0 36px 36px; text-align: center;">
          <img src='${logoUrl}' alt='Logo' width='60' style='margin-bottom: 12px;' />
          <div style="font-size: 1.3rem; font-weight: bold; margin-bottom: 8px;">Affordable Driving<br/>Traffic School</div>
          <div style="margin-bottom: 8px; font-size: 1rem;">
            West Palm Beach, FL | <a href="mailto:info@drivingschoolpalmbeach.com" style="color: #fff; text-decoration: underline;">info@drivingschoolpalmbeach.com</a> | 561 330 7007
          </div>
          <div style="font-size: 12px; color: #ccc;">&copy; ${new Date().getFullYear()} Powered By Botopia Technology S.A.S</div>
        </div>
      </div>
    </div>
  `;
  await transporter.sendMail({
    from: 'info@drivingschoolpalmbeach.com',
    to: data.email,
    subject: 'Your Verification Code',
    html,
  });
  return NextResponse.json({ success: true, message: 'Verification code sent to email.' });
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