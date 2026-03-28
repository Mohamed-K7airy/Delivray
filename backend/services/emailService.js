import { resend, SENDER_EMAIL } from '../config/resend.js';

export const sendVerificationEmail = async (email, name, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
  
  try {
    const { data, error } = await resend.emails.send({
      from: `Delivray <${SENDER_EMAIL}>`,
      to: [email],
      subject: 'Verify your Delivray Account',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #0f172a; text-align: center;">Welcome to Delivray, ${name}!</h2>
          <p style="color: #475569; line-height: 1.6;">Thank you for joining our delivery ecosystem. To complete your registration and active your account, please click the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #0f172a; color: white; padding: 12px 24px; text-decoration: none; rounded: 5px; font-weight: bold; display: inline-block;">Verify My Account</a>
          </div>
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">If you didn't create an account, you can safely ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #94a3b8; font-size: 10px; text-align: center;">&copy; 2024 Delivray. All rights reserved.</p>
        </div>
      `
    });

    if (error) {
      console.error('Resend Error:', error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (error) {
    console.error('Email Service Error:', error);
    return { success: false, error };
  }
};

export const sendOTPEmail = async (email, name, otp) => {
  try {
    const { data, error } = await resend.emails.send({
      from: `Delivray security<${SENDER_EMAIL}>`,
      to: [email],
      subject: 'Your Delivray Security Code',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #0f172a; text-align: center;">Security Verification</h2>
          <p style="color: #475569; line-height: 1.6;">Hello ${name},</p>
          <p style="color: #475569; line-height: 1.6;">You requested a password reset. Please use the following 6-digit code to proceed. This code will expire in 15 minutes.</p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #f8fafc; color: #0f172a; padding: 20px; font-size: 32px; font-weight: bold; letter-spacing: 5px; border-radius: 10px; border: 1px solid #e2e8f0; display: inline-block;">${otp}</div>
          </div>
          <p style="color: #e11d48; font-size: 12px; font-weight: bold;">Important: Do not share this code with anyone.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #94a3b8; font-size: 10px; text-align: center;">&copy; 2024 Delivray. All rights reserved.</p>
        </div>
      `
    });

    if (error) {
      console.error('Resend Error:', error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (error) {
    console.error('Email Service Error:', error);
    return { success: false, error };
  }
};
