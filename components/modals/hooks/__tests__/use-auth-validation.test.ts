import { signupSchema, loginSchema, otpSchema, signupResolver, loginResolver, otpResolver } from "../use-auth-validation";

describe("use-auth-validation exports", () => {
  it("should export the schemas and resolvers", () => {
    expect(signupSchema).toBeDefined();
    expect(loginSchema).toBeDefined();
    expect(otpSchema).toBeDefined();
    expect(signupResolver).toBeDefined();
    expect(loginResolver).toBeDefined();
    expect(otpResolver).toBeDefined();
  });
});
