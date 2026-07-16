import {
  signupSchema,
  loginSchema,
  otpSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} from "../auth";

describe("auth validations", () => {
  describe("signupSchema", () => {
    it("validates correct inputs", () => {
      const valid = signupSchema.safeParse({
        name: "John Doe",
        email: "test@example.com",
        password: "Valid123!Password",
      });
      expect(valid.success).toBe(true);
    });

    it("rejects short names", () => {
      const invalid = signupSchema.safeParse({
        name: "J",
        email: "test@example.com",
        password: "Str0ngP@ssw0rd!",
      });
      expect(invalid.success).toBe(false);
    });

    it("rejects names with short first name", () => {
      const invalid = signupSchema.safeParse({
        name: "J Doe",
        email: "test@example.com",
        password: "Str0ngP@ssw0rd!",
      });
      expect(invalid.success).toBe(false);
    });

    it("rejects names with HTML", () => {
      const invalid = signupSchema.safeParse({
        name: "John <b>Doe</b>",
        email: "test@example.com",
        password: "Valid123!Password",
      });
      expect(invalid.success).toBe(false);
    });

    it("rejects single word names", () => {
      const invalid = signupSchema.safeParse({
        name: "John",
        email: "test@example.com",
        password: "Valid123!Password",
      });
      expect(invalid.success).toBe(false);
    });
  });

  describe("loginSchema", () => {
    it("validates correct inputs", () => {
      const valid = loginSchema.safeParse({
        email: "test@example.com",
        password: "Valid123!",
      });
      expect(valid.success).toBe(true);
    });

    it("rejects invalid email", () => {
      const invalid = loginSchema.safeParse({
        email: "not-an-email",
        password: "Valid123!",
      });
      expect(invalid.success).toBe(false);
    });
  });

  describe("otpSchema", () => {
    it("validates exact 6 digits", () => {
      const valid = otpSchema.safeParse({ otp: "123456" });
      expect(valid.success).toBe(true);
    });

    it("rejects letters", () => {
      const invalid = otpSchema.safeParse({ otp: "123a56" });
      expect(invalid.success).toBe(false);
    });
  });

  describe("forgotPasswordSchema", () => {
    it("validates correct email", () => {
      const valid = forgotPasswordSchema.safeParse({ email: "test@example.com" });
      expect(valid.success).toBe(true);
    });
  });

  describe("resetPasswordSchema", () => {
    it("validates matching passwords", () => {
      const valid = resetPasswordSchema.safeParse({
        password: "Valid123!Password",
        confirmPassword: "Valid123!Password",
      });
      expect(valid.success).toBe(true);
    });

    it("rejects mismatching passwords", () => {
      const invalid = resetPasswordSchema.safeParse({
        password: "Valid123!Password",
        confirmPassword: "Mismatch123!",
      });
      expect(invalid.success).toBe(false);
      if (!invalid.success) {
        expect(invalid.error.issues[0].message).toBe("Passwords do not match.");
      }
    });
  });
});
