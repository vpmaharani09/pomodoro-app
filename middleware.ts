import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const isAuthPage = request.nextUrl.pathname === "/" || 
                    request.nextUrl.pathname === "/signin" || 
                    request.nextUrl.pathname === "/signup";
  const isMainApp = request.nextUrl.pathname.startsWith("/main-app");

  console.log("Current path:", request.nextUrl.pathname);
  console.log("Token:", token);

  // If user has a valid token, they should only be able to access main-app
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
      console.log("Valid token found");
      
      // If on auth page, redirect to main-app
      if (isAuthPage) {
        console.log("Redirecting to main-app");
        return NextResponse.redirect(new URL("/main-app", request.url));
      }
      
      // If on main-app, allow access
      if (isMainApp) {
        console.log("Allowing access to main-app");
        return NextResponse.next();
      }
    } catch (error) {
      console.log("Invalid token:", error);
      // If token is invalid, remove it
      const response = NextResponse.redirect(new URL("/signin", request.url));
      response.cookies.delete("token");
      return response;
    }
  }

  // If no token and trying to access main-app, redirect to signin
  if (isMainApp) {
    console.log("No token, redirecting to signin");
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  // If no token and on auth page, allow access
  if (isAuthPage) {
    console.log("No token, allowing access to auth page");
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/signin", "/signup", "/main-app", "/main-app/:path*"],
}; 