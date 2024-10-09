import { NextResponse } from "next/server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";

export const dynamic = "force-dynamic";

export const GET = async () => {
    const token = await getGoogleIdToken();

    const apiRes = await fetch("https://pathquest-api.app/", {
        method: "GET",
        cache: "no-cache",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await apiRes.json();

    return NextResponse.json(data);
};
