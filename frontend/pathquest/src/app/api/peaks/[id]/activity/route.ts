import { authOptions } from "@/auth/authOptions";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) => {
    const { id } = await params;
    const backendUrl = getBackendUrl();
    const url = `${backendUrl.replace(/\/$/, "")}/peaks/${id}/activity`;

    // Get session to pass user identity to backend (even though this is a public route)
    const session = await getServerSession(authOptions);
    // Always generate token for Google IAM authentication (required at infrastructure level)
    const token = await getGoogleIdToken().catch((err) => {
        console.error("[peaks/[id]/activity] Failed to get Google ID token:", err);
        return null;
    });

    try {
        const res = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                // Pass user identity via headers for backend auth
                ...(session?.user?.id ? { "x-user-id": session.user.id } : {}),
                ...(session?.user?.email ? { "x-user-email": session.user.email } : {}),
                ...(session?.user?.name ? { "x-user-name": encodeURIComponent(session.user.name) } : {}),
            },
        });

        if (!res.ok) {
            const text = await res.text();
            console.error("Failed to fetch peak activity:", text);
            return NextResponse.json(
                { message: "Failed to fetch peak activity" },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data, { status: 200 });
    } catch (err: any) {
        console.error("Error fetching peak activity:", err);
        return NextResponse.json(
            { message: err?.message ?? "Upstream error" },
            { status: 502 }
        );
    }
};

