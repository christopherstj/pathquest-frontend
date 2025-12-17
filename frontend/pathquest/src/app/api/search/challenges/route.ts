import { authOptions } from "@/auth/authOptions";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
    const backendUrl = getBackendUrl();
    
    // Get session to pass user identity to backend
    const session = await getServerSession(authOptions);
    // Always generate token for Google IAM authentication (required at infrastructure level)
    // User identity is passed via x-user-* headers for application-level auth
    const token = await getGoogleIdToken().catch((err) => {
        console.error("[challenges/search] Failed to get Google ID token:", err);
        return null;
    });

    const url = new URL(
        `${backendUrl.replace(/\/$/, "")}/challenges/search`
    );
    req.nextUrl.searchParams.forEach((value, key) => {
        url.searchParams.set(key, value);
    });

    const res = await fetch(url.toString(), {
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            // Pass user identity via headers
            ...(session?.user?.id ? { "x-user-id": session.user.id } : {}),
            ...(session?.user?.email ? { "x-user-email": session.user.email } : {}),
            ...(session?.user?.name ? { "x-user-name": session.user.name } : {}),
        },
    }).catch((err) =>
        NextResponse.json({ message: err?.message ?? "Upstream error" }, { status: 502 })
    );

    if (res instanceof NextResponse) return res;

    const text = await res.text();
    const contentType = res.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");

    return NextResponse.json(isJson ? JSON.parse(text) : text, {
        status: res.status,
    });
};

