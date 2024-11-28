// import { getServerStripe } from "@/helpers/getStripe";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
    const body = await req.json();

    // const stripe = await getServerStripe();

    return NextResponse.json({ body });
};
