import Stripe from "stripe";

const getSession = async (sessionId: string) => {
    const res = await fetch("/api/billing/check-session", {
        method: "POST",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId }),
    });

    if (!res.ok) {
        return null;
    }

    const session: Stripe.Response<Stripe.Checkout.Session> = (await res.json())
        .session;

    return session;
};

export default getSession;
