import getGoogleIdToken from "@/auth/getGoogleIdToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
    const backendUrl = getBackendUrl();

    const token = await getGoogleIdToken().catch((err) => {
        console.error("[landing/popular-challenges] Failed to get Google ID token:", err);
        return null;
    });

    const url = new URL(req.url);
    const limit = url.searchParams.get("limit") ?? "5";

    const upstreamUrl = `${backendUrl.replace(/\/$/, "")}/challenges/popular?limit=${encodeURIComponent(limit)}`;

    try {
        const res = await fetch(upstreamUrl, {
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });

        if (!res.ok) {
            const text = await res.text();
            console.error("Failed to fetch popular challenges:", text);
            return NextResponse.json(
                { message: "Failed to fetch popular challenges" },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data, { status: 200 });
    } catch (err: any) {
        console.error("Error fetching popular challenges:", err);
        return NextResponse.json(
            { message: err?.message ?? "Upstream error" },
            { status: 502 }
        );
    }
};


