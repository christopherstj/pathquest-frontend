import { NextResponse } from "next/server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";

export const dynamic = "force-dynamic";

export const POST = async () => {
    const token = await getGoogleIdToken();

    const session = await useAuth();

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
