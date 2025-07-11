import nodemailer from 'nodemailer';

const SMTP2GO_USER = process.env.SMTP_USER;
const SMTP2GO_PASSWORD = process.env.SMTP_PASS;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

if (!SMTP2GO_USER || !SMTP2GO_PASSWORD) {
  throw new Error('SMTP2GO credentials are not configured');
}

const SMPTP_HOST = process.env.SMTP_HOST ?? "mail.smtp2go.com"
const SMPTP_PORT = process.env.SMPTP_PORT ?? '2525'
const transporter = nodemailer.createTransport({
  host: SMPTP_HOST,
  port: parseInt(SMPTP_PORT), // STARTTLS (recommended)
  secure: false,
  auth: {
    user: SMTP2GO_USER,
    pass: SMTP2GO_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  }
});

interface Attachment {
  filename: string;
  content: Buffer;
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Attachment[];
}

export async function sendEmail({ to, subject, html, attachments }: EmailOptions) {
  try {
    await transporter.sendMail({
      from: 'notifications@daftaros.com',
      to,
      subject,
      html,
      attachments,
    });
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}

export { BASE_URL }; 