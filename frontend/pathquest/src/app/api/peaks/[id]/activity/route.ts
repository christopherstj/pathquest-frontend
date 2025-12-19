import getBackendUrl from "@/helpers/getBackendUrl";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) => {
    const { id } = await params;
    const backendUrl = getBackendUrl();
    const url = `${backendUrl.replace(/\/$/, "")}/peaks/${id}/activity`;

    try {
        const res = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
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

