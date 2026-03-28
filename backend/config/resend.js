import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

export const resend = new Resend(process.env.RESEND_API_KEY);
export const SENDER_EMAIL = process.env.SENDER_EMAIL || 'onboarding@resend.dev';
