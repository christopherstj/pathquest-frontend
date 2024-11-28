import { getServerStripe } from "@/helpers/getStripe";
import { NextApiRequest } from "next";

export const POST = async (req: NextApiRequest) => {
    const items = req.body.items;

    const stripe = await getServerStripe();
};
