import 'dotenv/config';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import User from '../models/User';

const logoUrl = "https://res.cloudinary.com/dzi2p0pqa/image/upload/v1739549973/sxsfccyjjnvmxtzlkjpi.png";

const template = handlebars.compile(`
  <div style="background: #f6f8fa; padding: 0; min-height: 100vh;">
    <div style="max-width: 600px; margin: 40px auto; background: #fff; border-radius: 18px; box-shadow: 0 4px 24px rgba(0,0,0,0.07); overflow: hidden;">
      <div style="background: linear-gradient(90deg, #0056b3 0%, #27ae60 100%); padding: 32px 0 24px 0; text-align: center;">
        <img src="${logoUrl}" alt="Logo" width="80" style="margin-bottom: 12px;" />
        <h1 style="color: #fff; font-size: 2rem; margin: 0; font-family: Arial, sans-serif; letter-spacing: 1px;">
          Happy Birthday!
        </h1>
      </div>
      <div style="padding: 36px 32px 24px 32px; font-family: Arial, sans-serif; color: #222;">
        <h2 style="color: #0056b3; margin-top: 0;">Hello, {{firstName}}!</h2>
        <div style="font-size: 1.1rem; margin-bottom: 32px; line-height: 1.7; text-align: justify;">
          🎉 We wish you a wonderful birthday and a fantastic year ahead!<br>
          Thank you for being part of our Driving School family.
        </div>
      </div>
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

async function sendBirthdayEmails() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in environment variables.");
  }
  await mongoose.connect(process.env.MONGODB_URI);

  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const regex = new RegExp(`-${month}-${day}$`);

  const users = await User.find({ birthDate: { $regex: regex } });

  if (users.length === 0) {
    console.log('No birthdays today.');
    return;
  }

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("SMTP credentials are not defined in environment variables.");
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  for (const user of users) {
    const html = template({ firstName: user.firstName || 'Student' });
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: user.email,
      subject: `Happy Birthday, ${user.firstName || 'Student'}!`,
      html,
    });
    console.log(`Birthday email sent to ${user.email}`);
  }

  await mongoose.disconnect();
}

sendBirthdayEmails().catch(console.error); 