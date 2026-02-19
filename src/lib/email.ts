import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: "PMS <noreply@revearts.com>",
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Email send error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Email send exception:", error);
    return { success: false, error };
  }
}

export function generateWelcomeEmailHtml(name: string, email: string, password: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to PMS</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px 16px 0 0; padding: 40px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to PMS! 🎉</h1>
          </div>
          <div style="background: white; border-radius: 0 0 16px 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">
              Hi <strong>${name}</strong>,
            </p>
            <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">
              Your account has been created on the Project Management System. Here are your login credentials:
            </p>
            <div style="background: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
              <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px;">Email</p>
              <p style="margin: 0 0 20px 0; color: #111827; font-size: 18px; font-weight: 600;">${email}</p>
              <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px;">Temporary Password</p>
              <p style="margin: 0; color: #111827; font-size: 18px; font-weight: 600; font-family: monospace; background: #e5e7eb; padding: 8px 12px; border-radius: 6px; display: inline-block;">${password}</p>
            </div>
            <p style="font-size: 14px; color: #6b7280; margin-bottom: 24px;">
              ⚠️ Please change your password after your first login for security.
            </p>
            <a href="${process.env.BETTER_AUTH_URL || "http://localhost:3000"}/sign-in" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Sign In Now →
            </a>
          </div>
          <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 24px;">
            © ${new Date().getFullYear()} PMS - Project Management System
          </p>
        </div>
      </body>
    </html>
  `;
}

export function generateResetPasswordEmailHtml(name: string, resetLink: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px 16px 0 0; padding: 40px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Reset Password 🔐</h1>
          </div>
          <div style="background: white; border-radius: 0 0 16px 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">
              Hi <strong>${name}</strong>,
            </p>
            <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">
              We received a request to reset your password. Click the button below to create a new password:
            </p>
            <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; margin-bottom: 24px;">
              Reset Password →
            </a>
            <p style="font-size: 14px; color: #6b7280; margin-top: 24px;">
              This link will expire in 1 hour. If you didn't request this, please ignore this email.
            </p>
          </div>
          <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 24px;">
            © ${new Date().getFullYear()} PMS - Project Management System
          </p>
        </div>
      </body>
    </html>
  `;
}
