import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { 
  strictLimiter, 
  publicLimiter, 
  standardLimiter, 
  adminLimiter 
} from "@/lib/rate-limit";

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
      const url = new URL("/auth/suspended", request.url);
      url.searchParams.set("secure", "1");
      if (email) url.searchParams.set("email", email);
      return NextResponse.redirect(url);
    }
    if (errorParam?.startsWith("AccountBanned")) {
      const parts = errorParam.split(":");
      const email = parts.length > 1 ? parts[1] : "";
      const url = new URL("/auth/banned", request.url);
      url.searchParams.set("secure", "1");
      if (email) url.searchParams.set("email", email);
      return NextResponse.redirect(url);
    }
  }

  // Protect auth error pages from direct unauthorized access
  const authErrorPages = ["/auth/locked", "/auth/suspended", "/auth/banned"];
  if (authErrorPages.includes(pathname)) {
    if (searchParams.get("secure") !== "1") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // --- API RATE LIMITING ---
  // Exclude auth session, callbacks, and error pages from rate limiting
  const isExcludedFromLimit = 
    pathname.startsWith("/api/auth/session") || 
    pathname.startsWith("/api/auth/callback") || 
    pathname.startsWith("/api/auth/error") ||
    pathname === "/blocked";

  const isHighRiskRoute = 
    pathname.startsWith("/api/auth") || 
    pathname.startsWith("/api/ai") || 
    pathname.startsWith("/api/host-applications") ||
    pathname.startsWith("/api/payments") ||
    pathname.startsWith("/api/admin") ||
    pathname.startsWith("/verify");

  if (isHighRiskRoute && !isExcludedFromLimit) {
    // 1. Identify the user (by IP)
    const ip = (request as any).ip || request.headers.get("x-forwarded-for") || "127.0.0.1";
    
    let limiter = standardLimiter; // Default

    // 2. Select the appropriate limiter bucket
    if (
      pathname.startsWith("/api/auth") || 
      pathname.startsWith("/api/ai") || 
      pathname.startsWith("/api/host-applications") ||
      pathname.startsWith("/api/payments")
    ) {
      limiter = strictLimiter;
    } else if (pathname.startsWith("/api/admin")) {
      limiter = adminLimiter;
    }

    // 3. Enforce the limit
    try {
      const { success, limit, reset, remaining } = await limiter.limit(ip);

      if (!success) {
        // If the request is for an API but it's a manual navigation (accepts HTML), redirect to our premium blocked page
        const accept = request.headers.get("accept");
        if (accept && accept.includes("text/html")) {
          return NextResponse.redirect(new URL("/blocked", request.url));
        }

        return new NextResponse(
          JSON.stringify({ 
            error: "Too many requests. Please try again later.",
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
      // Fail open if Redis is unreachable to avoid blocking legitimate users
      console.error("Rate limiting error:", error);
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
      "/admin/finance",
      "/admin/billing",
      "/admin/settings",
      "/admin/monitoring",
      "/admin/analytics",
      "/admin/properties",
      "/admin/overview",
      "/admin/user-management/roles",
      "/admin/user-management/analytics",
    ];

    const isSuperAdminRoute = SUPER_ADMIN_ONLY_ROUTES.some(route => pathname.startsWith(route));
    if (isSuperAdminRoute && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
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
