import nodemailer from 'nodemailer';

const SMTP2GO_USER = process.env.SMTP_USER;
const SMTP2GO_PASSWORD = process.env.SMTP_PASS;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

if (!SMTP2GO_USER || !SMTP2GO_PASSWORD) {
  throw new Error('SMTP2GO credentials are not configured');
}

const transporter = nodemailer.createTransport({
  host: 'mail.smtp2go.com',
  port: 2525,
  secure: false,
  auth: {
    user: SMTP2GO_USER,
    pass: SMTP2GO_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  }
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    await transporter.sendMail({
      from: 'notifications@daftaros.com',
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}

export { BASE_URL }; 