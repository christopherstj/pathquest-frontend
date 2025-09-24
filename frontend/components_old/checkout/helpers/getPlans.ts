import ProductDisplay from "@/typeDefs/ProductDisplay";

const getPlans = async () => {
    const response = await fetch("/api/billing/get-products");
    const json = await response.json();
    return json.plans as ProductDisplay[];
};

export default getPlans;
