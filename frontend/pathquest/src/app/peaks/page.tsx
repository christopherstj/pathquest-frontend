import { redirect } from "next/navigation";

// Redirect /peaks to home - peak details require an ID
const PeaksIndexPage = () => {
    redirect("/");
};

export default PeaksIndexPage;

