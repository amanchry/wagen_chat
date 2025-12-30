// middleware.js
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {

  // List of public routes that don't require authentication
  const publicPaths = ["/auth/login", "/auth/signup", "/auth/forgot-password", "/api", "/_next", "/favicon.ico", "/images", "/public"];
  const { pathname } = req.nextUrl;

  // Allow requests to public paths
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });



  if (!token) {

    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // ❌ Token exists but no Django backend token inside it

  if (!token.user?.token) {
    console.log("⚠️ Django token missing or expired — logging out user.");
    // Clear cookie/session and redirect
    const response = NextResponse.redirect(new URL("/auth/login", req.url));
    response.cookies.set("next-auth.session-token", "", { maxAge: 0 });
    response.cookies.set("next-auth.csrf-token", "", { maxAge: 0 });
    response.cookies.set("next-auth.callback-url", "", { maxAge: 0 });
    return response;
  }

  // Otherwise, allow the request
  return NextResponse.next();
}

// Optionally, specify which paths to run the middleware on
export const config = {
  matcher: [
    /*
      Match all request paths except for:
      - /api (API routes)
      - /_next (Next.js internals)
      - /auth/login and /auth/signup (public auth pages)
      - /favicon.ico, /images, /public (static assets)
    */
    "/((?!api|_next|auth/login|auth/signup|auth/forgot-password|favicon.ico|images|public).*)",
  ],
};
