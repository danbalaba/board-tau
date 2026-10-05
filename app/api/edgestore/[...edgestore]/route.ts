import { createEdgeStoreNextHandler } from "@edgestore/server/adapters/next/app";
import { getToken } from "next-auth/jwt";
import { edgeStoreRouter } from "@/lib/edgestore-router";

const handler = createEdgeStoreNextHandler({
  router: edgeStoreRouter,
  createContext: async ({ req }) => {
    const secret = process.env.NEXTAUTH_SECRET;
    const token = await getToken({
      req: req as any,
      secret,
    });

    const userId = (token?.id as string) || (token?.sub as string) || (token?.email as string) || "unauthenticated";
    const role = ((token?.role as string) || (token as any)?.userRole || "USER").toUpperCase();

    if (userId === "unauthenticated") {
      console.warn("[EdgeStore Auth Warning] Request is unauthenticated or token failed decryption.", {
        hasSecret: Boolean(secret),
        hasToken: Boolean(token),
        cookies: req.headers.get("cookie") ? "present" : "missing",
      });
    }

    return {
      userId,
      role: token ? role : "GUEST",
    };
  },
});

export { handler as GET, handler as POST };
