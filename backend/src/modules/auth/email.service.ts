import sgMail from "@sendgrid/mail";
import nodemailer, { type Transporter } from "nodemailer";

import { env } from "../../config/env.js";

const sendgridConfigured = Boolean(env.SENDGRID_API_KEY);
const smtpConfigured = Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);

if (sendgridConfigured) {
  sgMail.setApiKey(env.SENDGRID_API_KEY);
}

const transporter = smtpConfigured
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    })
  : null;

let etherealTransport: Transporter | null = null;

export function isEmailConfigured(): boolean {
  return sendgridConfigured || smtpConfigured;
}

async function getEtherealTransport(): Promise<Transporter> {
  if (!etherealTransport) {
    const testAccount = await nodemailer.createTestAccount();
    etherealTransport = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
  }
  return etherealTransport;
}

function buildMail(to: string, otp: string) {
  const html = [
    `<div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e7e7ee;border-radius:14px">`,
    `<h2 style="margin:0 0 6px">Verify your email</h2>`,
    `<p style="color:#5a6172;font-size:14px">Use the code below to verify your email address. It expires in 10 minutes.</p>`,
    `<div style="margin:20px 0;padding:16px;border-radius:10px;background:#f4f0ff;text-align:center">`,
    `<span style="font-size:32px;font-weight:800;letter-spacing:8px;color:#5b2cf0">${otp}</span>`,
    `</div>`,
    `<p style="color:#98a2b3;font-size:12px">If you didn't request this code, you can safely ignore this email.</p>`,
    `<p style="color:#98a2b3;font-size:12px;margin-top:22px">— LOOP AI Customer Feedback Intelligence Platform</p>`,
    `</div>`,
  ].join("");

  return {
    subject: "Your LOOP verification code",
    text: `Your LOOP verification code is ${otp}. It expires in 10 minutes.`,
    html,
  };
}

export async function sendOtpEmail(
  to: string,
  otp: string,
): Promise<{ previewUrl?: string }> {
  const mail = buildMail(to, otp);
  const fromName = env.MAIL_FROM_NAME;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: { name: fromName, address: env.SMTP_USER },
        to,
        ...mail,
      });
      return {};
    } catch (error) {
      console.warn(`[email] SMTP failed for ${to}, falling back to Ethereal:`, error);
    }
  }

  if (sendgridConfigured) {
    try {
      await sgMail.send({
        to,
        from: { email: env.MAIL_FROM, name: fromName },
        ...mail,
      });
      return {};
    } catch (error) {
      console.warn(`[email] SendGrid failed for ${to}, falling back to Ethereal:`, error);
    }
  }

  const ethereal = await getEtherealTransport();
  const info = await ethereal.sendMail({
    from: { name: fromName, address: env.MAIL_FROM },
    to,
    ...mail,
  });
  const previewUrl = nodemailer.getTestMessageUrl(info);

  return { previewUrl: previewUrl || undefined };
}
