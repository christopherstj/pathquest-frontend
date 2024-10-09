import { NextResponse } from "next/server";
import { NextApiRequest, NextApiResponse } from "next";
import getGoogleIdToken from "@/auth/getGoogleIdToken";

export const GET = async (req: NextApiRequest, res: NextApiResponse) => {
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
