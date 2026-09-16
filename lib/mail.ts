import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendMail({ to, subject, html }: SendMailOptions) {
  try {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.warn("Gmail SMTP credentials missing. Skipping email send.");
      return;
    }
    await transporter.sendMail({
      from: `"TaskFlow" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Failed to send email notification:", error);
    // Silent fail to ensure main DB business logic is uninterrupted
  }
}

export function generateEmailTemplate(
  title: string,
  content: string,
  actionUrl?: string,
) {
  return `
    <div style="font-family: Arial, sans-serif; background-color: #f4f7f6; padding: 20px; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
        <div style="background-color: #2563eb; padding: 20px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 24px; font-weight: bold;">TaskFlow</h1>
          <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Smart Todo Management</p>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #1e293b; margin-top: 0;">${title}</h2>
          <div style="font-size: 15px; line-height: 1.6; color: #475569;">
            ${content}
          </div>
          ${
            actionUrl
              ? `<div style="margin-top: 30px; text-align: center;">
                  <a href="${actionUrl}" style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">View Task</a>
                </div>`
              : ""
          }
        </div>
        <div style="background-color: #f8fafc; padding: 15px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
          &copy; ${new Date().getFullYear()} TaskFlow. All rights reserved.
        </div>
      </div>
    </div>
  `;
}
