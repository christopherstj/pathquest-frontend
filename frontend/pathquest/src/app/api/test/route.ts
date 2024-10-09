import { NextResponse } from "next/server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";

export const dynamic = "force-dynamic";

export const POST = async () => {
    const session = await useAuth();

    return NextResponse.json(session);
};
