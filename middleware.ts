import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
    if (role !== "admin") {
      const homeUrl = new URL("/", request.url);
      return NextResponse.redirect(homeUrl);
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
    if (role !== "landlord") {
      const homeUrl = new URL("/", request.url);
      return NextResponse.redirect(homeUrl);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/landlord/:path*"],
};
