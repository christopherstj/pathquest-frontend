import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import { NextRequest, NextResponse } from "next/server";

const backendUrl = getBackendUrl();

export const POST = async (req: NextRequest) => {
    const id = await req.json();

    const token = await getGoogleIdToken();

    const user = await fetch(`${backendUrl}/user`, {
        method: "POST",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            id,
        }),
    });

    if (!user.ok) {
        console.error(await user.text());
        return NextResponse.json(null, { status: 500 });
    }

    const { userFound } = await user.json();

    return NextResponse.json({ userFound });
};
