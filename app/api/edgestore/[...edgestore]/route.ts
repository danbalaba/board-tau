import { createEdgeStoreNextHandler } from "@edgestore/server/adapters/next/app";
import { getToken } from "next-auth/jwt";
import { edgeStoreRouter } from "@/lib/edgestore-router";
import { NextRequest, NextResponse } from "next/server";

const edgeStoreHandler = createEdgeStoreNextHandler({
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

async function resilientHandler(req: NextRequest) {
  try {
    const response = await edgeStoreHandler(req);
    // If /init failed with 500 (e.g. EdgeStore service downtime or transient cloud error),
    // return an empty 200 response ({}) so the frontend @edgestore/react provider does not throw
    // an unhandled promise rejection across the entire application.
    const isInit = req.nextUrl?.pathname?.endsWith("/init") ?? false;
    if (isInit && response.status >= 500) {
      console.warn("[EdgeStore Route] Gracefully mitigating /init 500 error from upstream EdgeStore cloud.");
      return NextResponse.json({}, { status: 200 });
    }
    return response;
  } catch (error) {
    console.error("[EdgeStore Route Exception]:", error);
    const isInit = req.nextUrl?.pathname?.endsWith("/init") ?? false;
    if (isInit) {
      return NextResponse.json({}, { status: 200 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export { resilientHandler as GET, resilientHandler as POST };
