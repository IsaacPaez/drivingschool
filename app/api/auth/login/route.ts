import { NextRequest, NextResponse } from 'next/server';
import Instructor from '@/models/Instructor';
import User from '@/models/User';
import { connectDB } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import AuthCode from '@/models/AuthCode';

// Guardar códigos temporalmente en memoria (en producción usar Redis o DB)
const codeStore: Record<string, { code: string; expires: number }> = globalThis._codeStore || (globalThis._codeStore = {});

export async function POST(req: NextRequest) {
  await connectDB();
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  // 1. Buscar en instructores
  const instructor = await Instructor.findOne({ email });
  if (instructor) {
    const valid = await bcrypt.compare(password, instructor.password);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }
    return NextResponse.json({
      success: true,
      user: {
        _id: instructor._id,
        instructorId: instructor._id,
        name: instructor.name,
        email: instructor.email,
        photo: instructor.photo,
        type: 'instructor',
      },
    });
  }

  // 2. Buscar en users
  const user = await User.findOne({ email });
  if (user) {
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }
    // Generar código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    // Eliminar códigos anteriores no usados para ese email
    await AuthCode.deleteMany({ email: email.trim().toLowerCase(), used: false });
    // Guardar el nuevo código en la base de datos
    await AuthCode.create({
      email: email.trim().toLowerCase(),
      code,
      expires: new Date(Date.now() + 10 * 60 * 1000),
      used: false,
    });

    // Enviar correo
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
            <h2 style="color: #0056b3; margin-top: 0;">Hello, <b>${user.firstName?.toUpperCase() || 'User'}</b>!</h2>
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
      to: email,
      subject: 'Your Verification Code',
      html,
    });
    return NextResponse.json({ success: true, type: 'user', needsVerification: true });
  }

  return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
} 