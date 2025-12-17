import { authOptions } from "@/auth/authOptions";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
    // Get session using getServerSession with authOptions
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json(
            { message: "Unauthorized" },
            { status: 401 }
        );
    }

    const backendUrl = getBackendUrl();
    
    // Always generate token for Google IAM authentication (required at infrastructure level)
    // Returns empty string in development, valid token in production
    const token = await getGoogleIdToken().catch((err) => {
        console.error("[recent-summits] Failed to get Google ID token:", err);
        return null;
    });

    const url = `${backendUrl.replace(/\/$/, "")}/peaks/summits/recent`;

    try {
        const res = await fetch(url, {
            headers: {
                // Use Bearer token if available, otherwise use header-based identity
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                // Always pass user info via headers for backend auth
                "x-user-id": session.user.id,
                ...(session.user.email ? { "x-user-email": session.user.email } : {}),
                ...(session.user.name ? { "x-user-name": session.user.name } : {}),
            },
        });

        if (!res.ok) {
            const text = await res.text();
            console.error("Failed to fetch recent summits:", text);
            return NextResponse.json(
                { message: "Failed to fetch recent summits" },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data, { status: 200 });
    } catch (err: any) {
        console.error("Error fetching recent summits:", err);
        return NextResponse.json(
            { message: err?.message ?? "Upstream error" },
            { status: 502 }
        );
    }
};

