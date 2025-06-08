import { NextRequest, NextResponse } from 'next/server';
import Instructor from '@/models/Instructor';
import User from '@/models/User';
import { connectDB } from '@/lib/mongodb';
import nodemailer from 'nodemailer';
import PasswordResetCode from '@/models/PasswordResetCode';

const resetCodeStore: Record<string, { code: string; expires: number }> = globalThis._resetCodeStore || (globalThis._resetCodeStore = {});

export async function POST(req: NextRequest) {
  await connectDB();
  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
  }
  let userType = '';
  let user = await Instructor.findOne({ email });
  if (user) userType = 'instructor';
  if (!user) {
    user = await User.findOne({ email });
    if (user) userType = 'user';
  }
  if (!user) {
    return NextResponse.json({ error: 'No account found with that email.' }, { status: 404 });
  }
  // Eliminar códigos anteriores no usados para ese email
  await PasswordResetCode.deleteMany({ email: email.trim().toLowerCase(), used: false });
  // Generar código de 6 dígitos
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  // Guardar el nuevo código en la base de datos
  await PasswordResetCode.create({
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
          <h2 style="color: #0056b3; margin-top: 0;">Password Reset Code</h2>
          <div style="font-size: 1.1rem; margin-bottom: 32px; line-height: 1.7; text-align: center;">
            <div style="font-size: 1.2rem; margin-bottom: 12px;">Your password reset code is:</div>
            <div style="font-size: 2.5rem; font-weight: bold; color: #2346a0; background: #f0f6ff; border-radius: 12px; padding: 18px 0; letter-spacing: 8px; margin: 0 auto; max-width: 220px;">${code}</div>
          </div>
          <div style="margin-top: 18px; color: #888; font-size: 1rem; text-align: center;">This code will expire in 10 minutes.</div>
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
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Your Password Reset Code',
    html,
  });
  return NextResponse.json({ success: true, userType });
} 