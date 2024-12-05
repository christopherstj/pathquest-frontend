import processHistoricalData from "@/actions/processHistoricalData";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const backendUrl = getBackendUrl();

export const POST = async (req: NextRequest) => {
    const session = await useAuth();

    if (!session) {
        return new NextResponse(undefined, {
            status: 401,
        });
    }

    const userId = session.user.id;

    const token = await getGoogleIdToken();

    try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");

        const { sessionId } = await req.json();

        const stripeSession = await stripe.checkout.sessions.retrieve(
            sessionId
        );

        if (stripeSession.payment_status === "paid") {
            const res = await fetch(
                `${backendUrl}/billing/create-subscription`,
                {
                    method: "POST",
                    cache: "no-cache",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        stripeUserId:
                            typeof stripeSession.customer === "string"
                                ? stripeSession.customer
                                : stripeSession.customer?.id ?? null,
                        email: stripeSession.customer_details?.email ?? null,
                        userId: session.user.id.toString(),
                    }),
                }
            );

            if (!res.ok) {
                console.error(await res.text());
                return new NextResponse(undefined, {
                    status: 500,
                });
            }
        }

        revalidatePath(`${backendUrl}/user`);
        return NextResponse.json({ session: stripeSession });
    } catch (err) {
        console.error(err);
        return new NextResponse(undefined, {
            status: 500,
        });
    }
};
