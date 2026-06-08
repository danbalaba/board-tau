"use server";
import { db } from "@/lib/db";
import bcrypt from 'bcryptjs';
import { generateAndStoreOTP, sendOTPEmail } from "@/lib/otp";
import { sanitizeInput } from "@/lib/validators";
import { signupSchema } from "@/lib/validations/auth";

export const registerUser = async ({
  name,
  email,
  password: inputPassword,
}: {
  name: string;
  email: string;
  password: string;
}) => {
  try {
    // Sanitize inputs to prevent XSS attacks
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedPassword = inputPassword;

    // 🛡️ Enterprise Validation via Zod
    const validation = signupSchema.safeParse({
      name: sanitizedName,
      email: sanitizedEmail,
      password: sanitizedPassword,
    });

    if (!validation.success) {
      return { error: validation.error.issues[0].message };
    }

    const hashedPassword = await bcrypt.hash(sanitizedPassword, 12);

    // Check if user already exists
    let user = await db.user.findUnique({
      where: { email: sanitizedEmail },
    });

    if (user) {
      // User exists - check if they have a password set
      if (user.password) {
        return { error: "User with this email already exists. Please use login instead." };
      } else {
        // User exists but no password - update with password
        user = await db.user.update({
          where: { email: sanitizedEmail },
          data: {
            name: sanitizedName,
            password: hashedPassword,
          },
        });
      }
    } else {
      // User does not exist - create new user
      user = await db.user.create({
        data: {
          email: sanitizedEmail,
          name: sanitizedName,
          password: hashedPassword,
        },
      });
    }

    // Send OTP email
    const otp = await generateAndStoreOTP(sanitizedEmail);
    await sendOTPEmail(sanitizedEmail, otp);

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      }
    };
  } catch (error: any) {
    console.error("REGISTRATION_ERROR", error);
    return { error: error.message || "An unexpected error occurred during registration" };
  }
};
