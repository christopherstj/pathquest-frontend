import getGoogleIdToken from "@/auth/getGoogleIdToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) => {
    const { id: peakId } = await params;
    const backendUrl = getBackendUrl();

    const token = await getGoogleIdToken().catch((err) => {
        console.error("[peaks/public-summits] Failed to get Google ID token:", err);
        return null;
    });

    // Forward query params to backend
    const searchParams = req.nextUrl.searchParams;
    const queryString = searchParams.toString();

    const upstreamUrl = `${backendUrl.replace(/\/$/, "")}/peaks/${peakId}/public-summits${queryString ? `?${queryString}` : ""}`;

    try {
        const res = await fetch(upstreamUrl, {
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });

        if (!res.ok) {
            const text = await res.text();
            console.error("Failed to fetch public summits:", text);
            return NextResponse.json(
                { message: "Failed to fetch public summits" },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data, { status: 200 });
    } catch (err: any) {
        console.error("Error fetching public summits:", err);
        return NextResponse.json(
            { message: err?.message ?? "Upstream error" },
            { status: 502 }
        );
    }
};

