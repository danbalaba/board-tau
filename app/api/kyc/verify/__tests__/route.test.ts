/**
 * @jest-environment node
 */
import { POST } from "../route";

const mockSend = jest.fn();

jest.mock("@aws-sdk/client-rekognition", () => {
  return {
    RekognitionClient: jest.fn().mockImplementation(() => ({
      send: mockSend,
    })),
    CompareFacesCommand: jest.fn().mockImplementation((args) => args),
    DetectTextCommand: jest.fn().mockImplementation((args) => args),
    DetectLabelsCommand: jest.fn().mockImplementation((args) => args),
  };
});

describe("KYC Verify API Route (/api/kyc/verify)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.AWS_ACCESS_KEY_ID;
    delete process.env.AWS_SECRET_ACCESS_KEY;
  });

  it("returns 400 if image URLs are missing", async () => {
    const req = new Request("http://localhost/api/kyc/verify", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain("Missing required image URLs");
  });

  it("falls back gracefully when AWS credentials are not configured", async () => {
    const req = new Request("http://localhost/api/kyc/verify", {
      method: "POST",
      body: JSON.stringify({ selfieUrl: "https://example.com/selfie.jpg", idCardUrl: "https://example.com/id.jpg" }),
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.verifiedBy).toBe("client-fallback");
  });

  it("calls AWS Rekognition and returns verified status when face matches and ID text exists", async () => {
    process.env.AWS_ACCESS_KEY_ID = "test-key";
    process.env.AWS_SECRET_ACCESS_KEY = "test-secret";
    process.env.AWS_REGION = "us-east-2";

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(10)),
    }) as any;

    mockSend
      .mockResolvedValueOnce({
        FaceMatches: [{ Similarity: 95.5 }],
      })
      .mockResolvedValueOnce({
        TextDetections: [
          { DetectedText: "REPUBLIC OF THE PHILIPPINES" },
          { DetectedText: "DRIVER LICENSE" },
        ],
      });

    const req = new Request("http://localhost/api/kyc/verify", {
      method: "POST",
      body: JSON.stringify({ selfieUrl: "https://example.com/selfie.jpg", idCardUrl: "https://example.com/id.jpg" }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.similarity).toBe(96);
    expect(data.hasIDKeywords).toBe(true);
    expect(data.status).toBe("VERIFIED");
  });
});
