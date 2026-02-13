import bcrypt from 'bcryptjs'
import { AuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { db } from "./db";
import { validateEmail, validatePassword, sanitizeInput } from "./validators";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "email", type: "text" },
        password: {
          label: "password",
          type: "password",
        },
      },

      async authorize(credentials) {
        // Sanitize inputs to prevent XSS
        const sanitizedEmail = sanitizeInput(credentials?.email || "");
        const sanitizedPassword = credentials?.password || "";

        // Validate inputs
        const emailError = validateEmail(sanitizedEmail);
        const passwordError = validatePassword(sanitizedPassword);

        if (emailError || passwordError) {
          throw new Error("Invalid credentials");
        }

        const user = await db.user.findUnique({
          where: {
            email: sanitizedEmail,
          },
        });

        if (!user || !user?.password) throw new Error("Invalid credentials");

        // Check if email is verified
        if (!user.emailVerified) {
          throw new Error("Email not verified. Please verify your email first.");
        }

        const isCorrectPassword = await bcrypt.compare(
          sanitizedPassword,
          user.password
        );

        if (!isCorrectPassword) throw new Error("Invalid credentials");

        return user;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("🔐 signIn callback - user:", user);
      console.log("🔐 signIn callback - account:", account);
      console.log("🔐 signIn callback - profile:", profile);

      // For Google and GitHub OAuth
      if (user.email && (account?.provider === "google" || account?.provider === "github")) {
        // Get existing user by email
        const existingUser = await db.user.findUnique({
          where: { email: user.email }
        });

        if (existingUser) {
          console.log("🔐 Existing user found:", existingUser.id);
          // Check if existing user has any accounts linked
          const existingAccounts = await db.account.findMany({
            where: { userId: existingUser.id }
          });

          console.log("🔐 Existing accounts for user:", existingAccounts.map(acc => ({ provider: acc.provider, id: acc.providerAccountId })));

          // If user has accounts, check if current provider is already linked
          if (existingAccounts.length > 0) {
            const isCurrentProviderLinked = existingAccounts.some(
              (acc) => acc.provider === account?.provider
            );

            if (!isCurrentProviderLinked) {
              console.log("🔐 Account not linked - creating new account record for existing user");
              // Link the account to existing user instead of throwing error
              await db.account.create({
                data: {
                  userId: existingUser.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  refresh_token: account.refresh_token,
                  access_token: account.access_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                  session_state: account.session_state,
                },
              });
              console.log("🔐 Account linked successfully");
            }
          } else {
            console.log("🔐 User exists but has no accounts - creating new account record");
            // Create account for user with no existing accounts
            await db.account.create({
              data: {
                userId: existingUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                refresh_token: account.refresh_token,
                access_token: account.access_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
                session_state: account.session_state,
              },
            });
          }

          // Ensure emailVerified is set for OAuth users
          if (!existingUser.emailVerified) {
            console.log("🔐 Updating emailVerified for existing user");
            await db.user.update({
              where: { id: existingUser.id },
              data: { emailVerified: new Date() } as any // Type assertion to fix TypeScript error
            });
          }

          // Return true to indicate successful sign in
          console.log("🔐 Existing user sign in successful");
          return true;
        }

        console.log("🔐 New user - Prisma adapter will create user and account");
        // We'll update emailVerified after user creation
        return true;
      }

      // For credentials, require email verification
      if (account?.provider === "credentials" && user.email) {
        const userFromDb = await db.user.findUnique({
          where: { email: user.email }
        });
        const isEmailVerified = !!userFromDb?.emailVerified;
        console.log("🔐 Credentials sign in - email verified:", isEmailVerified);
        return isEmailVerified;
      }

      console.log("🔐 Default sign in return true");
      return true;
    },

    async session({ token, session }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.role = token.role;
        session.user.emailVerified = token.emailVerified;
      }

      return session;
    },

    async jwt({ token, user, account }) {
      if (user) {
        // For new users created via OAuth, ensure emailVerified is set
        const userWithEmailVerified = {
          ...user,
          emailVerified: (user as { emailVerified?: Date }).emailVerified || new Date()
        };

        // If user is new (created via OAuth), update emailVerified in database
        if (!(user as any).emailVerified && (account?.provider === "google" || account?.provider === "github")) {
          try {
            await db.user.update({
              where: { id: user.id },
              data: { emailVerified: new Date() } as any
            });
            console.log("🔐 Updated emailVerified for new OAuth user:", user.id);
          } catch (error) {
            console.error("🔐 Failed to update emailVerified for new OAuth user:", error);
          }
        }

        return {
          ...token,
          id: user.id,
          role: (user as { role?: string }).role,
          emailVerified: userWithEmailVerified.emailVerified
        } as any; // Type assertion to fix TypeScript error
      }

      // For OAuth providers, ensure emailVerified is set in JWT
      if (account?.provider === "google" || account?.provider === "github") {
        return {
          ...token,
          emailVerified: new Date()
        } as any; // Type assertion to fix TypeScript error
      }

      return token;
    },
  },
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
