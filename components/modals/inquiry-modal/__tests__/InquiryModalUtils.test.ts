import { getSafeImageSrc, getSafeImageSrcString, base64ToFile } from "../InquiryModalUtils";

describe("InquiryModalUtils", () => {
  beforeAll(() => {
    global.URL.createObjectURL = jest.fn(() => "blob:http://localhost/test-blob");
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe("getSafeImageSrc", () => {
    it("returns empty string if file is null", () => {
      expect(getSafeImageSrc(null)).toBe("");
    });
    
    it("returns safe blob url for valid image file", () => {
      const file = new File(["dummy content"], "test.png", { type: "image/png" });
      const result = getSafeImageSrc(file);
      expect(result).toBe("blob:http://localhost/test-blob");
    });

    it("returns empty string if URL.createObjectURL throws an error", () => {
      (global.URL.createObjectURL as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Failed to create object URL");
      });
      const file = new File(["dummy"], "error.png", { type: "image/png" });
      expect(getSafeImageSrc(file)).toBe("");
    });

    it("returns empty string for unsafe file types", () => {
      const unsafeFile = new File(["test"], "test.txt", { type: "text/plain" });
      expect(getSafeImageSrc(unsafeFile)).toBe("");
    });
  });

  describe("getSafeImageSrcString", () => {
    it("allows https urls", () => {
      const url = "https://example.com/image.jpg";
      expect(getSafeImageSrcString(url)).toBe(url);
    });

    it("allows relative urls", () => {
      const url = "/images/local.png";
      expect(getSafeImageSrcString(url)).toBe(url);
    });

    it("returns empty string for malicious javascript: urls", () => {
      expect(getSafeImageSrcString("javascript:alert(1)")).toBe("");
    });

    it("returns empty string for unsafe characters", () => {
      // The function strips out `<` and `>` but then the length or exact match check fails
      expect(getSafeImageSrcString("https://example.com/<script>")).toBe("");
    });
  });

  describe("base64ToFile", () => {
    it("converts a base64 string to a File object", () => {
      // Very simple base64 1x1 png image
      const base64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==";
      const file = base64ToFile(base64, "test.png");
      
      expect(file).toBeInstanceOf(File);
      expect(file.name).toBe("test.png");
      expect(file.type).toBe("image/png");
      expect(file.size).toBeGreaterThan(0);
    });
  });
});
