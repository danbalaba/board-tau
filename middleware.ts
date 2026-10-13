import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { 
  strictLimiter, 
  aiLimiter,
  publicLimiter, 
  standardLimiter, 
  adminLimiter,
  kycLimiter 
} from "@/lib/rate-limit";
import { createRestrictionToken, verifyRestrictionToken } from "@/lib/security-tokens";

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // --- HOME PAGE ROLE REDIRECT ---
  // Redirect logged-in internal roles away from the public home page instantly
  if (pathname === "/") {
    if (token?.role === "ADMIN" || token?.role === "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (token?.role === "LANDLORD") {
      return NextResponse.redirect(new URL("/landlord", request.url));
    }
  }

  // --- CUSTOM AUTH ERROR REDIRECTS ---
  // Catch the AccountLocked, AccountSuspended, and AccountBanned errors from NextAuth and redirect to our high-fidelity pages
  if (pathname.startsWith("/api/auth/error")) {
    const errorParam = searchParams.get("error");
    if (errorParam?.startsWith("AccountLocked")) {
      const parts = errorParam.split(":");
      const email = parts.length > 1 ? parts[1] : "";
      const url = new URL("/auth/locked", request.url);
      url.searchParams.set("secure", "1");
      if (email) url.searchParams.set("email", email);
      return NextResponse.redirect(url);
    }
    if (errorParam?.startsWith("AccountSuspended")) {
      const parts = errorParam.split(":");
      const email = parts.length > 1 ? parts[1] : "";
      const token = createRestrictionToken(email, "suspended");
      const url = new URL("/auth/suspended", request.url);
      url.searchParams.set("token", token);
      return NextResponse.redirect(url);
    }
    if (errorParam?.startsWith("AccountBanned")) {
      const parts = errorParam.split(":");
      const email = parts.length > 1 ? parts[1] : "";
      const token = createRestrictionToken(email, "banned");
      const url = new URL("/auth/banned", request.url);
      url.searchParams.set("token", token);
      return NextResponse.redirect(url);
    }
  }

  // Protect auth error pages from direct unauthorized access
  if (pathname === "/auth/locked") {
    if (searchParams.get("secure") !== "1") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  const authRestrictionPages = ["/auth/suspended", "/auth/banned"];
  if (authRestrictionPages.includes(pathname)) {
    const token = searchParams.get("token");
    const payload = verifyRestrictionToken(token);
    if (!payload) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // --- API RATE LIMITING (DEMO-SAFE & MULTI-TIERED) ---
  // 1. Safe exclusions: Background polling, webhooks, health checks, cron triggers
  const isExcludedFromLimit = 
    pathname.startsWith("/api/auth/session") || 
    pathname.startsWith("/api/auth/callback") || 
    pathname.startsWith("/api/auth/error") ||
    pathname.startsWith("/api/webhooks") ||
    pathname.startsWith("/api/health") ||
    pathname.startsWith("/api/cron") ||
    pathname.startsWith("/api/pusher") ||
    pathname.startsWith("/api/edgestore") ||
    pathname === "/blocked";

  // 2. Emergency demo bypass switch for peace of mind during live defense
  const isDemoBypass = 
    process.env.ENABLE_RATE_LIMIT === "false" ||
    request.headers.get("x-boardtau-demo") === "capstone2026";

  if (pathname.startsWith("/api") && !isExcludedFromLimit && !isDemoBypass) {
    // Key by authenticated User ID (prevents panelists on shared campus Wi-Fi from colliding)
    const ip = (request as any).ip || request.headers.get("x-forwarded-for") || "127.0.0.1";
    const identifier = token?.id ? `usr_${token.id}` : `ip_${ip}`;
    
    // Default: Standard Limiter (180 req / 1 min for Landlords & Tenants)
    let limiter = standardLimiter;

    if (
      pathname.startsWith("/api/auth") || 
      pathname.startsWith("/api/payments") || 
      pathname.startsWith("/api/host-applications")
    ) {
      limiter = strictLimiter; // 40 req / 1 min
    } else if (pathname.startsWith("/api/ai")) {
      limiter = aiLimiter;     // 60 req / 1 min (Generous for continuous back-and-forth chat & search)
    } else if (pathname.startsWith("/api/kyc")) {
      limiter = kycLimiter;    // 10 req / 1 min (AWS Rekognition protection)
    } else if (pathname.startsWith("/api/admin")) {
      limiter = adminLimiter;  // 200 req / 1 min (Super Admin bulk management)
    } else if (
      (pathname === "/api/listings" && request.method === "GET") ||
      pathname.startsWith("/api/property-types") ||
      pathname.startsWith("/api/room-types") ||
      pathname.startsWith("/api/colleges") ||
      pathname.startsWith("/api/routing")
    ) {
      limiter = publicLimiter; // 120 req / 1 min (Public browse & map interactions)
    }

    try {
      const { success, limit, reset, remaining } = await limiter.limit(identifier);

      if (!success) {
        // Redirect browser navigation to high-fidelity blocked page; return 429 for API fetch calls
        const accept = request.headers.get("accept");
        if (accept && accept.includes("text/html")) {
          return NextResponse.redirect(new URL("/blocked", request.url));
        }

        return new NextResponse(
          JSON.stringify({ 
            error: "Too many requests. Please wait a moment before trying again.",
            message: "Rate limit exceeded" 
          }),
          { 
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "X-RateLimit-Limit": limit.toString(),
              "X-RateLimit-Remaining": remaining.toString(),
              "X-RateLimit-Reset": reset.toString()
            }
          }
        );
      }
    } catch (error) {
      // Fail-open: If Redis is temporarily unreachable, allow the request to pass smoothly
      console.warn("[RateLimiter] Fail-open on Redis timeout/error:", error);
    }
  }

  // Admin routes protection
  if (pathname.startsWith("/admin")) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token?.id) {
      const signInUrl = new URL("/", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }

    const role = token.role as string | undefined;
    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
      const unauthorizedUrl = new URL("/unauthorized", request.url);
      return NextResponse.redirect(unauthorizedUrl);
    }

    // Role-based route protection
    const SUPER_ADMIN_ONLY_ROUTES = [
      "/admin/billing",
      "/admin/settings",
      "/admin/monitoring",
      "/admin/analytics",
      "/admin/overview",
    ];

    const isSuperAdminRoute = SUPER_ADMIN_ONLY_ROUTES.some(route => pathname.startsWith(route));
    if (isSuperAdminRoute && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    if (pathname.startsWith("/admin/dashboard") && role === "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/admin/overview", request.url));
    }

    return NextResponse.next();
  }

  // Landlord routes protection
  if (pathname.startsWith("/landlord")) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token?.id) {
      const signInUrl = new URL("/", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }

    const role = token.role as string | undefined;
    if (role !== "LANDLORD") {
      const unauthorizedUrl = new URL("/unauthorized", request.url);
      return NextResponse.redirect(unauthorizedUrl);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/auth/:path*",
    "/admin/:path*", 
    "/landlord/:path*",
    "/api/:path*",
    "/verify/:path*"
  ],
};
