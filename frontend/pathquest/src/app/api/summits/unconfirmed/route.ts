import { authOptions } from "@/auth/authOptions";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json(
            { message: "Unauthorized" },
            { status: 401 }
        );
    }

    const backendUrl = getBackendUrl();
    const token = await getGoogleIdToken().catch((err) => {
        console.error("[unconfirmed-summits] Failed to get Google ID token:", err);
        return null;
    });

    const { searchParams } = new URL(req.url);
    const limit = searchParams.get("limit");
    const queryString = limit ? `?limit=${limit}` : "";
    
    const url = `${backendUrl.replace(/\/$/, "")}/peaks/summits/unconfirmed${queryString}`;

    try {
        const res = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                "x-user-id": session.user.id,
                ...(session.user.email ? { "x-user-email": session.user.email } : {}),
                ...(session.user.name ? { "x-user-name": encodeURIComponent(session.user.name) } : {}),
            },
        });

        if (!res.ok) {
            const text = await res.text();
            console.error("Failed to fetch unconfirmed summits:", text);
            return NextResponse.json(
                { message: "Failed to fetch unconfirmed summits" },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data, { status: 200 });
    } catch (err: any) {
        console.error("Error fetching unconfirmed summits:", err);
        return NextResponse.json(
            { message: err?.message ?? "Upstream error" },
            { status: 502 }
        );
    }
};

