import bcrypt from 'bcryptjs'
import { AuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { db } from "./db";
import { validateEmail, validatePassword, sanitizeInput } from "./validators";
import { triggerLoginSecurityAlert } from "@/services/auth-security";
import { getPostHogClient } from "@/lib/posthog-server";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID as string,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        return {
          id: profile.id,
          name: profile.name,
          email: profile.email || `${profile.id}@facebook.com`,
          image: profile.picture.data.url,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email || `${profile.sub}@google.com`,
          image: profile.picture,
        };
      },
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

        if (!user) throw new Error("Invalid credentials");

        // 1. Check for Login Lockout (Brute-force)
        if (user.loginLockoutUntil && user.loginLockoutUntil > new Date()) {
          const remainingMinutes = Math.ceil((user.loginLockoutUntil.getTime() - Date.now()) / (1000 * 60));
          throw new Error(`Account locked due to multiple failed attempts. Please try again in ${remainingMinutes} minute(s).`);
        }

        // 2. Check for permanent OTP lock
        const otpLock = await db.emailOTP.findFirst({
          where: {
            email: sanitizedEmail,
            isPermanentlyLocked: true,
          },
        });

        if (otpLock) {
          throw new Error('AccountLocked');
        }

        // 3. Strike System / Admin Suspension Check
        if (user.isPermanentlyBanned) {
          throw new Error(`AccountBanned:${sanitizedEmail}`);
        }
        if (user.isActive === false) {
          throw new Error(`AccountSuspended:${sanitizedEmail}`);
        }

        if (!user.password) throw new Error("Invalid credentials");

        // 4. Skip email verification for admin users
        if (!user.emailVerified && user.role !== "ADMIN") {
          throw new Error("Email not verified. Please verify your email first.");
        }

        const isCorrectPassword = await bcrypt.compare(
          sanitizedPassword,
          user.password
        );

        if (!isCorrectPassword) {
          // Increment failed attempts
          const newAttempts = (user.failedLoginAttempts || 0) + 1;
          let lockoutUntil = null;
          
          if (newAttempts >= 5) {
            // lockoutUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minute lockout (Production)
            lockoutUntil = new Date(Date.now() + 60 * 1000); // 60 second lockout (Demo)
          }

          await db.user.update({
            where: { id: user.id },
            data: { 
              failedLoginAttempts: newAttempts,
              loginLockoutUntil: lockoutUntil
            }
          });

          throw new Error("Invalid credentials");
        }

        // 4. Success - Reset failed attempts
        await db.user.update({
          where: { id: user.id },
          data: { 
            failedLoginAttempts: 0,
            loginLockoutUntil: null
          }
        });

        return user;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // 0. Check for permanent OTP lock for ALL providers (Credentials, Google, Facebook)
      if (user.email) {
        const otpLock = await db.emailOTP.findFirst({
          where: {
            email: user.email,
            isPermanentlyLocked: true,
          },
        });

        if (otpLock) {
          console.log(`🔐 Blocked sign-in attempt for locked email: ${user.email}`);
          // Pass the email in the error message for the frontend to handle redirect
          throw new Error(`AccountLocked:${user.email}`);
        }
      }

      // Check for login lockout during OAuth as well
      if (user.email) {
        const dbUser = await db.user.findUnique({
          where: { email: user.email },
          select: { loginLockoutUntil: true, isActive: true, isPermanentlyBanned: true }
        });
        
        if (dbUser?.loginLockoutUntil && dbUser.loginLockoutUntil > new Date()) {
          throw new Error(`AccountLocked:${user.email}`);
        }
        
        // Strike System / Admin Suspension Check for OAuth
        if (dbUser?.isPermanentlyBanned) {
          throw new Error(`AccountBanned:${user.email}`);
        }
        if (dbUser?.isActive === false) {
          throw new Error(`AccountSuspended:${user.email}`);
        }
      }

      // Trigger New Login Email Notification
      if (user.email) {
        // Run in background
        triggerLoginSecurityAlert({
          email: user.email,
          name: user.name,
        });
      }

      // Update last login timestamp for every sign in event
      // Only attempt update if we have a valid MongoDB ObjectID (24 chars)
      if (user.id && user.id.length === 24) {
        try {
          await db.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() }
          });
          console.log(`🔐 lastLogin updated for user: ${user.id}`);
        } catch (error) {
          console.error("🔐 Failed to update lastLogin:", error);
        }
      } else {
        console.log("🔐 Skipping lastLogin update - user.id is not a valid database ID yet");
      }

      console.log("🔐 signIn callback - user:", user);
      console.log("🔐 signIn callback - account:", account);
      console.log("🔐 signIn callback - profile:", profile);

      // For Google and Facebook OAuth
      if (user.email && (account?.provider === "google" || account?.provider === "facebook")) {
        // Get existing user by email
        const existingUser = await db.user.findUnique({
          where: { email: user.email }
        });

        if (existingUser) {
          console.log("🔐 Existing user found:", existingUser.id);
          
          // Ensure emailVerified is set for OAuth users
          if (!existingUser.emailVerified) {
            console.log("🔐 Updating emailVerified for existing user");
            await db.user.update({
              where: { id: existingUser.id },
              data: { emailVerified: new Date() } as any
            });
          }

          console.log("🔐 Existing user sign in successful (Native linking handles the rest)");
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

      // Capture sign-in event server-side (fire-and-forget)
      if (user.id) {
        try {
          const posthog = getPostHogClient();
          posthog.identify({
            distinctId: user.id,
            properties: { name: user.name, role: (user as any).role },
          });
          posthog.capture({
            distinctId: user.id,
            event: "user_signed_in",
            properties: { provider: account?.provider ?? "unknown" },
          });
          await posthog.flush();
        } catch (phErr) {
          console.error("PostHog sign-in capture failed:", phErr);
        }
      }

      return true;
    },

    async session({ token, session }) {
      // 🔐 If token is marked as invalid (security mismatch), return an empty session
      // This prevents CLIENT_FETCH_ERROR while still signaling no session
      if ((token as any).isInvalid) {
        return {
          ...session,
          user: null
        } as any;
      }

      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.role = token.role;
        session.user.emailVerified = token.emailVerified;
        session.user.isVerifiedLandlord = token.isVerifiedLandlord;
        session.user.image = (token as any).image;
        session.user.securityVersion = (token as any).securityVersion;
      }

      return session;
    },

    async jwt({ token, user, account }) {
      if (user) {
        return {
          ...token,
          id: user.id,
          role: (user as any).role || "USER",
          emailVerified: (user as any).emailVerified || new Date(),
          isVerifiedLandlord: (user as any).isVerifiedLandlord || false,
          image: user.image,
          securityVersion: (user as any).securityVersion || 1,
        } as any;
      }

      // 🔐 SECURITY CHECK: Verify securityVersion and active status against DB on every refresh
      if (token.id) {
        try {
          const dbUser = await db.user.findUnique({
            where: { id: token.id as string },
            select: { securityVersion: true, role: true, isActive: true, isPermanentlyBanned: true }
          });

          if (!dbUser) return null as any;

          // If DB version is higher than token version, user changed password or security was reset
          if (dbUser.securityVersion !== (token as any).securityVersion) {
            console.log(`🔐 Global Logout: securityVersion mismatch for user ${token.id}`);
            // Return an object that triggers logout in the session callback
            return { isInvalid: true } as any;
          }
          
          // 🔐 STRIKE SYSTEM / OTP BRUTE FORCE: Global Session Invalidation
          if (dbUser.isActive === false || dbUser.isPermanentlyBanned === true) {
            console.log(`🔐 Global Logout: Account suspended or banned for user ${token.id}`);
            return { isInvalid: true } as any;
          }

          if (!token.role) {
            token.role = dbUser.role;
          }
        } catch (error) {
          console.error("🔐 Error verifying securityVersion:", error);
        }
      }

      // For OAuth providers, ensure emailVerified is set
      if ((account?.provider === "google" || account?.provider === "facebook") && !token.emailVerified) {
        (token as any).emailVerified = new Date();
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
