import { 
  sanitizeSecurityString, 
  validateStrictChars, 
  isCleanString, 
  validatePhoneNumber 
} from "../security";

describe("security validations", () => {
  describe("sanitizeSecurityString", () => {
    it("escapes HTML characters", () => {
      expect(sanitizeSecurityString("<script>alert('XSS')</script>")).toBe("&lt;script&gt;alert(&#x27;XSS&#x27;)&lt;/script&gt;");
    });

    it("removes SQL keywords", () => {
      expect(sanitizeSecurityString("SELECT * FROM users")).toBe(" * FROM users");
      expect(sanitizeSecurityString("DROP TABLE students")).toBe(" TABLE students");
    });

    it("handles empty strings", () => {
      expect(sanitizeSecurityString("")).toBe("");
    });
  });

  describe("validateStrictChars", () => {
    it("allows numbers, hyphens, and underscores", () => {
      expect(validateStrictChars("123-456_789")).toBe(true);
    });

    it("rejects letters and special characters", () => {
      expect(validateStrictChars("123abc!")).toBe(false);
      expect(validateStrictChars("my_id_number")).toBe(false);
    });

    it("allows empty strings", () => {
      expect(validateStrictChars("")).toBe(true);
    });
  });

  describe("isCleanString", () => {
    it("allows clean strings", () => {
      expect(isCleanString("Hello World")).toBe(true);
      expect(isCleanString("Price: 500")).toBe(true);
    });

    it("rejects suspicious characters", () => {
      expect(isCleanString("Hello <script>")).toBe(false);
      expect(isCleanString("Array[0]")).toBe(false);
      expect(isCleanString("Object{a:1}")).toBe(false);
    });

    it("allows empty strings", () => {
      expect(isCleanString("")).toBe(true);
    });
  });

  describe("validatePhoneNumber", () => {
    it("allows valid PH mobile numbers", () => {
      expect(validatePhoneNumber("09123456789")).toBe(true);
      expect(validatePhoneNumber("+639123456789")).toBe(true);
    });

    it("allows formatted phone numbers by stripping spaces/hyphens", () => {
      expect(validatePhoneNumber("0912 345 6789")).toBe(true);
      expect(validatePhoneNumber("+63 912-345-6789")).toBe(true);
    });

    it("allows international numbers", () => {
      expect(validatePhoneNumber("+14155552671")).toBe(true);
    });

    it("rejects invalid numbers", () => {
      expect(validatePhoneNumber("12345")).toBe(false); // too short
      expect(validatePhoneNumber("08123456789")).toBe(false); // PH must start with 09
      expect(validatePhoneNumber("")).toBe(false);
    });
  });
});
