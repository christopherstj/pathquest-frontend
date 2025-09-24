import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import getBackendUrl from "@/helpers/getBackendUrl";

const backendUrl = getBackendUrl();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

export const POST = async (request: NextRequest) => {
    const body = await request.text();
    const sig = request.headers.get("stripe-signature") ?? "";
    let event;

    try {
        event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err) {
        console.error("Error verifying webhook signature:", err);
        return NextResponse.json(
            { error: `Webhook Error: ${(err as Error).message}` },
            { status: 400 }
        );
    }

    // Handle the event
    switch (event.type) {
        case "customer.subscription.deleted":
            await handleSubscriptionDeleted(event.data.object);
            break;
        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
};

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const res = await fetch(`${backendUrl}/billing/delete-subscription`, {
        method: "POST",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            stripeUserId:
                typeof subscription.customer === "string"
                    ? subscription.customer
                    : subscription.customer?.id,
        }),
    });

    if (!res.ok) {
        console.error(await res.text());
        return;
    }
    console.log("Subscription deleted:", subscription.id);

    return;
}
