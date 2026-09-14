// NextAuth.js v5 configuration with email provider
import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import EmailProvider from "next-auth/providers/email";
import { db } from "@/lib/db";
import { users, accounts, sessions, verificationTokens } from "@/lib/db/schema";
import type { Adapter } from "next-auth/adapters";
import type { DefaultSession } from "next-auth";

// Extend the User type to include our custom fields
declare module "next-auth" {
  interface User {
    role?: string;
    subscriptionStatus?: string;
  }
  interface Session {
    user: {
      id: string;
      role: string;
      subscriptionStatus: string;
    } & DefaultSession["user"];
  }
}

// Helper to safely create the adapter
function createAdapter() {
  if (!db) return undefined;
  return DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }) as Adapter;
}

const authConfig = {
  adapter: createAdapter(),
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST || "smtp.resend.com",
        port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
        auth: {
          user: process.env.EMAIL_SERVER_USER || "resend",
          pass: process.env.EMAIL_SERVER_PASSWORD || "",
        },
      },
      from: process.env.EMAIL_FROM || "noreply@calculators.com",
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
    verifyRequest: "/auth/verify",
  },
  callbacks: {
    async session({ session, user }: { session: any; user: any }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role || "user";
        session.user.subscriptionStatus = user.subscriptionStatus || "free";
      }
      return session;
    },
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || "user";
        token.subscriptionStatus = user.subscriptionStatus || "free";
      }
      return token;
    },
  },
  session: {
    strategy: "database" as const,
  },
  secret: process.env.AUTH_SECRET || "dev-secret-change-in-production",
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
