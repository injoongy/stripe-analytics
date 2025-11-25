import ResetPasswordEmail from "@/components/emails/reset-password";
import VerifyPassword from "@/components/emails/verify-password";
import db from "@/db";
import * as schema from "@/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { Resend } from 'resend';

// Lazy initialization to avoid build-time errors
let resendInstance: Resend | null = null;
const getResend = () => {
  if (!resendInstance) {
    resendInstance = new Resend(process.env.RESEND_KEY || '');
  }
  return resendInstance;
};

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  basePath: "/api/auth",
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      if (!user.email) {
        console.warn("Cannot send verification email: missing user email");
        return;
      }

      const result = await getResend().emails.send({
        from: 'Guru Catcher <onboarding@resend.dev>',
        to: [user.email],
        subject: 'Confirm your email',
        react: VerifyPassword({
          username: user.name ?? user.email,
          verifyUrl: url,
        }),
      });

      console.log('Verification email requested', {
        success: Boolean(result?.data?.id),
        userId: user.id,
      })
    }
  },
  emailAndPassword: {
    enabled: true,
    sendOnSignUp: true,
    async sendResetPassword({ user, url }) {
      if (!user.email) {
        console.warn("Cannot send reset password email: missing user email");
        return;
      }

      const result = await getResend().emails.send({
        from: 'Guru Catcher <onboarding@resend.dev>',
        to: [user.email],
        subject: 'Reset your password',
        react: ResetPasswordEmail({
          username: user.name ?? user.email,
          resetUrl: url,
        }),
      });

      console.log('Password reset email requested', {
        success: Boolean(result?.data?.id),
        userId: user.id,
      })
    },
  },
  plugins: [nextCookies()]
});
