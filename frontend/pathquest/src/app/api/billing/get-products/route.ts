import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const GET = async (req: NextRequest) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {});

    const prices = await stripe.prices.list({
        expand: ["data.product"],
        active: true,
        type: "recurring",
    });

    const plans = prices.data
        .map((price) => {
            return {
                id: price.id,
                // @ts-expect-error - Stripe types are incorrect
                name: price.product.name,
                // @ts-expect-error - Stripe types are incorrect
                description: price.product.description,
                price: price.unit_amount,
                interval: price.recurring?.interval,
                price_id: price.id,
            };
        })
        .filter((plan) => plan !== null);

    return NextResponse.json({ plans });
};
