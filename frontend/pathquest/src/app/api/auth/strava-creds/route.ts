import getGoogleIdToken from "@/auth/getGoogleIdToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import { StravaCreds } from "@/typeDefs/StravaCreds";
import { NextRequest, NextResponse } from "next/server";

const backendUrl = getBackendUrl();

export const POST = async (req: NextRequest, res: NextResponse) => {
    const data: StravaCreds = await req.json();

    const token = await getGoogleIdToken();

    const response = await fetch(`${backendUrl}/strava-creds`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    return new NextResponse(await response.text(), {
        status: response.status,
    });
};
