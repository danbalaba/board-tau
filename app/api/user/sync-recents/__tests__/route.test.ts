/**
 * @jest-environment node
 */
import { POST } from "../route";
import { getCurrentUser } from "@/services/user";
import { db } from "@/lib/db";

jest.mock("@/services/user", () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock("@/lib/db", () => ({
  db: {
    user: {
      update: jest.fn(),
    },
  },
}));

describe("POST /api/user/sync-recents", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 when user is not authenticated without throwing RangeError", async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue(null);

    const req = new Request("http://localhost/api/user/sync-recents", {
      method: "POST",
      body: JSON.stringify({ recentListingIds: ["id1"], recentSearchQueries: ["query1"] }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("successfully updates recents when authenticated and caps to 20 unique items", async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue({ id: "user-123" });
    (db.user.update as jest.Mock).mockResolvedValue({ id: "user-123" });

    const queries = Array.from({ length: 30 }, (_, i) => `query-${i % 25}`);
    const ids = Array.from({ length: 30 }, (_, i) => `id-${i % 25}`);

    const req = new Request("http://localhost/api/user/sync-recents", {
      method: "POST",
      body: JSON.stringify({
        recentSearchQueries: queries,
        recentListingIds: ids,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ success: true });

    expect(db.user.update).toHaveBeenCalledWith({
      where: { id: "user-123" },
      data: {
        recentSearchQueries: expect.any(Array),
        recentListingIds: expect.any(Array),
      },
    });

    const updateCall = (db.user.update as jest.Mock).mock.calls[0][0];
    expect(updateCall.data.recentSearchQueries.length).toBeLessThanOrEqual(20);
    expect(updateCall.data.recentListingIds.length).toBeLessThanOrEqual(20);
  });

  it("handles malformed/empty JSON gracefully", async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue({ id: "user-123" });
    (db.user.update as jest.Mock).mockResolvedValue({ id: "user-123" });

    const req = new Request("http://localhost/api/user/sync-recents", {
      method: "POST",
      body: "not-json",
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ success: true });
  });
});
