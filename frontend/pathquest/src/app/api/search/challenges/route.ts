import getGoogleIdToken from "@/auth/getGoogleIdToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
    const backendUrl = getBackendUrl();
    const token = await getGoogleIdToken().catch(() => null);

    const url = new URL(
        `${backendUrl.replace(/\/$/, "")}/challenges/search`
    );
    req.nextUrl.searchParams.forEach((value, key) => {
        url.searchParams.set(key, value);
    });

    const res = await fetch(url.toString(), {
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

