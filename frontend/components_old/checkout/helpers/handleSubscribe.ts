import { loadStripe } from "@stripe/stripe-js";

const handleSubscribe = async (priceId: string) => {
    const stripe = await loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""
    );

    if (!stripe) {
        return;
    }

    const response = await fetch("/api/billing/create-subscription", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ priceId }),
    });

    const { sessionId } = await response.json();

    const result = await stripe.redirectToCheckout({ sessionId });

    if (result.error) {
        console.error(result.error);
    }
};

export default handleSubscribe;
