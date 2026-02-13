"use server";
import { db } from "@/lib/db";
import bcrypt from 'bcryptjs';
import { generateAndStoreOTP, sendOTPEmail } from "@/lib/otp";
import { validateName, validateEmail, validatePassword, sanitizeInput } from "@/lib/validators";

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
    const sanitizedPassword = inputPassword; // Don't sanitize passwords

    // Validate inputs
    const nameError = validateName(sanitizedName);
    const emailError = validateEmail(sanitizedEmail);
    const passwordError = validatePassword(sanitizedPassword);

    if (nameError) throw new Error(nameError);
    if (emailError) throw new Error(emailError);
    if (passwordError) throw new Error(passwordError);

    const hashedPassword = await bcrypt.hash(sanitizedPassword, 12);

    // Check if user already exists
    let user = await db.user.findUnique({
      where: { email: sanitizedEmail },
    });

    if (user) {
      // User exists - check if they have a password set
      if (user.password) {
        throw new Error("User with this email already exists. Please use login instead.");
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
      id: user.id,
      email: user.email,
      name: user.name,
    };
  } catch (error: any) {
    throw new Error(error.message);
  }
};
