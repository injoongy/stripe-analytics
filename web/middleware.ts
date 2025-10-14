import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
    const sessionCookie = getSessionCookie(request);
    const path = request.nextUrl.pathname;

    // Redirect authenticated users away from auth pages
    if (sessionCookie && (path === "/sign-in" || path === "/sign-up")) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Redirect unauthenticated users from protected pages
    if (!sessionCookie && path === "/dashboard") {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard", "/sign-in", "/sign-up"], // Specify the routes the middleware applies to
};