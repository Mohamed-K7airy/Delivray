import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
  console.warn('[Warning] RESEND_API_KEY is missing. Email service will be disabled.');
}

export const resend = apiKey ? new Resend(apiKey) : null;
export const SENDER_EMAIL = process.env.SENDER_EMAIL || 'onboarding@resend.dev';
