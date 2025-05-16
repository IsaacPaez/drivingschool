import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import User from '../../../models/User';
import handlebars from 'handlebars';

export async function POST(req: NextRequest) {
  try {
    const { recipients, subject, body } = await req.json();

    // Solo aceptar arrays de correos explícitos
    if (!Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ error: 'Recipients must be a non-empty array of emails.' }, { status: 400 });
    }

    // Eliminar duplicados y correos vacíos
    const emails = [...new Set(recipients.filter(e => !!e))];

    let firstName = "Student";
    let lastName = "";
    if (recipients.length === 1) {
      const user = await User.findOne({ email: recipients[0] });
      if (user) {
        firstName = user.firstName || "Student";
        lastName = user.lastName || "";
      }
    }

    const logoUrl = "https://res.cloudinary.com/dzi2p0pqa/image/upload/v1739549973/sxsfccyjjnvmxtzlkjpi.png";
    const template = handlebars.compile(`
      <div style="background: #f6f8fa; padding: 0; min-height: 100vh;">
        <div style="max-width: 600px; margin: 40px auto; background: #fff; border-radius: 18px; box-shadow: 0 4px 24px rgba(0,0,0,0.07); overflow: hidden;">
          <!-- Header -->
          <div style="background: linear-gradient(90deg, #0056b3 0%, #27ae60 100%); padding: 32px 0 24px 0; text-align: center;">
            <img src="${logoUrl}" alt="Logo" width="80" style="margin-bottom: 12px;" />
            <h1 style="color: #fff; font-size: 2rem; margin: 0; font-family: Arial, sans-serif; letter-spacing: 1px;">
              Driving School Notification
            </h1>
          </div>
          <!-- Body -->
          <div style="padding: 36px 32px 24px 32px; font-family: Arial, sans-serif; color: #222;">
            <h2 style="color: #0056b3; margin-top: 0;">Hello, {{firstName}}{{#if lastName}} {{lastName}}{{/if}}!</h2>
            <div style="font-size: 1.1rem; margin-bottom: 32px; line-height: 1.7; text-align: justify;">
              {{{message}}}
            </div>
          </div>
          <!-- Footer -->
          <div style="background: linear-gradient(135deg, #0056b3, #000); color: white; padding: 32px 24px; border-radius: 0 0 36px 36px; text-align: center;">
            <img src='${logoUrl}' alt='Logo' width='60' style='margin-bottom: 12px;' />
            <div style="font-size: 1.3rem; font-weight: bold; margin-bottom: 8px;">Affordable Driving<br/>Traffic School</div>
            <div style="margin-bottom: 8px; font-size: 1rem;">
              West Palm Beach, FL | <a href="mailto:info@drivingschoolpalmbeach.com" style="color: #fff; text-decoration: underline;">info@drivingschoolpalmbeach.com</a> | 561 330 7007
            </div>
            <div style="font-size: 12px; color: #ccc;">
              &copy; ${new Date().getFullYear()} Powered By Botopia Technology S.A.S
            </div>
          </div>
        </div>
      </div>
    `);
    const html = template({ firstName, lastName, message: body });

    // Configurar el transporter de Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Enviar el correo solo a los emails recibidos
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: emails,
      subject,
      html,
    });

    return NextResponse.json({ success: true, info });
  } catch (error: unknown) {
    console.error('EMAIL ERROR:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
