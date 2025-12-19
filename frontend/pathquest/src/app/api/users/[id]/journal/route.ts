import { authOptions } from "@/auth/authOptions";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) => {
    const { id: userId } = await params;
    
    // Get session using getServerSession (optional auth for public profiles)
    const session = await getServerSession(authOptions);

    const backendUrl = getBackendUrl();
    
    // Generate token for Google IAM authentication
    const token = await getGoogleIdToken().catch((err) => {
        console.error("[user-journal] Failed to get Google ID token:", err);
        return null;
    });

    // Forward query params to backend
    const searchParams = req.nextUrl.searchParams;
    const queryString = searchParams.toString();
    const url = `${backendUrl.replace(/\/$/, "")}/users/${userId}/journal${queryString ? `?${queryString}` : ""}`;

    try {
        const res = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                // Pass user info if logged in (for private access)
                ...(session?.user?.id ? { "x-user-id": session.user.id } : {}),
                ...(session?.user?.email ? { "x-user-email": session.user.email } : {}),
                ...(session?.user?.name ? { "x-user-name": encodeURIComponent(session.user.name) } : {}),
            },
        });

        if (!res.ok) {
            const text = await res.text();
            console.error("Failed to fetch user journal:", text);
            return NextResponse.json(
                { message: "Failed to fetch user journal" },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data, { status: 200 });
    } catch (err: any) {
        console.error("Error fetching user journal:", err);
        return NextResponse.json(
            { message: err?.message ?? "Upstream error" },
            { status: 502 }
        );
    }
};

