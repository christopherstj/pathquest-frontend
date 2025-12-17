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
    
    // Get the Google ID token for backend auth (returns empty string in dev)
    const token = await getGoogleIdToken().catch((err) => {
        console.error("Failed to get Google ID token:", err);
        return null;
    });

    const url = `${backendUrl.replace(/\/$/, "")}/users/${session.user.id}/activities-processing`;

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
            console.error("Failed to fetch queue status:", text);
            return NextResponse.json(
                { message: "Failed to fetch queue status" },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data, { status: 200 });
    } catch (err: any) {
        console.error("Error fetching queue status:", err);
        return NextResponse.json(
            { message: err?.message ?? "Upstream error" },
            { status: 502 }
        );
    }
};

