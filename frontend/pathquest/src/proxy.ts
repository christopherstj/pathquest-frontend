import { NextResponse } from "next/server";

export function proxy(request: Request) {
    const url = new URL(request.url);
    const { pathname } = url;

    // Redirect legacy auth routes to home (auth is now handled via modal)
    if (
        pathname.startsWith("/login") ||
        pathname.startsWith("/signup") ||
        pathname.startsWith("/m/")
    ) {
        const redirectUrl = new URL("/", request.url);
        redirectUrl.search = "";
        return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match legacy routes that need to be redirected
         */
        "/login/:path*",
        "/signup/:path*",
        "/m/:path*",
    ],
};

