import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const POST = async (req: NextRequest) => {
    const { priceId } = await req.json();

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");

    const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
            {
                price: priceId,
                quantity: 1,
            },
        ],
        success_url: `${req.headers.get(
            "origin"
        )}/checkout/success?sessionId={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.get("origin")}/checkout`,
    });

    return NextResponse.json({ sessionId: session.id });
};
