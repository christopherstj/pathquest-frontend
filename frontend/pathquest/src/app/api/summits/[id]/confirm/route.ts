import { authOptions } from "@/auth/authOptions";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) => {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json(
            { message: "Unauthorized" },
            { status: 401 }
        );
    }

    const { id } = await params;
    const backendUrl = getBackendUrl();
    const token = await getGoogleIdToken().catch((err) => {
        console.error("[confirm-summit] Failed to get Google ID token:", err);
        return null;
    });

    const url = `${backendUrl.replace(/\/$/, "")}/peaks/summits/${id}/confirm`;

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                "x-user-id": session.user.id,
                ...(session.user.email ? { "x-user-email": session.user.email } : {}),
                ...(session.user.name ? { "x-user-name": encodeURIComponent(session.user.name) } : {}),
            },
        });

        if (!res.ok) {
            const text = await res.text();
            console.error("Failed to confirm summit:", text);
            return NextResponse.json(
                { message: "Failed to confirm summit" },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data, { status: 200 });
    } catch (err: any) {
        console.error("Error confirming summit:", err);
        return NextResponse.json(
            { message: err?.message ?? "Upstream error" },
            { status: 502 }
        );
    }
};

