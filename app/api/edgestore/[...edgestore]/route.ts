import { createEdgeStoreNextHandler } from "@edgestore/server/adapters/next/app";
import { getToken } from "next-auth/jwt";
import { edgeStoreRouter } from "@/lib/edgestore-router";

const handler = createEdgeStoreNextHandler({
  router: edgeStoreRouter,
  createContext: async ({ req }) => {
    const token = await getToken({
      req: req as any,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (token) {
      const role = ((token.role as string) || (token as any).userRole || "USER").toUpperCase();
      return {
        userId: (token.id as string) || (token.sub as string) || "unauthenticated",
        role: role,
      };
    }

    return {
      userId: "unauthenticated",
      role: "GUEST",
    };
  },
});

export { handler as GET, handler as POST };
