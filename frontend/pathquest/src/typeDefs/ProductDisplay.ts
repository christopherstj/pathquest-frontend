import Stripe from "stripe";

export default interface ProductDisplay {
    id: string;
    name: string;
    description: string | null;
    price: number | null;
    interval: Stripe.Price.Recurring.Interval | undefined;
    price_id: string;
}
