import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    });

    const { pathname } = request.nextUrl;

    // If user is logged in, redirect away from login/signup pages (except email-form)
    if (
        token &&
        (pathname.startsWith("/login") ||
            (pathname.startsWith("/signup") &&
                pathname !== "/signup/email-form"))
    ) {
        // If they have an email, send them to the app
        // If they don't have an email, send them to the email form
        const redirectUrl =
            request.nextUrl.searchParams.get("redirectUrl") || "/m/peaks";
        const url = request.nextUrl.clone();

        if (token.email) {
            url.pathname = redirectUrl;
            url.search = "";
        } else {
            url.pathname = "/signup/email-form";
            url.search = "";
            url.searchParams.set("redirectUrl", redirectUrl);
        }

        return NextResponse.redirect(url);
    }

    // If user is logged in but has no email
    if (token && !token.email) {
        // Allow access to the email form page itself and auth-related pages
        const allowedPaths = [
            "/signup/email-form",
            "/api/auth",
            "/login",
            "/logout",
        ];

        const isAllowedPath = allowedPaths.some((path) =>
            pathname.startsWith(path)
        );

        // If trying to access a protected page without email, redirect to email form
        if (!isAllowedPath) {
            const url = request.nextUrl.clone();
            url.pathname = "/signup/email-form";
            url.searchParams.set("redirectUrl", pathname);
            return NextResponse.redirect(url);
        }
    }

    // If user has email and is on the email form, redirect to their intended destination
    if (token?.email && pathname === "/signup/email-form") {
        const redirectUrl =
            request.nextUrl.searchParams.get("redirectUrl") || "/m/peaks";
        const url = request.nextUrl.clone();
        url.pathname = redirectUrl;
        url.search = "";
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
