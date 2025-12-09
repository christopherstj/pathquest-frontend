import { redirect } from "next/navigation";

// Redirect /challenges to home - challenge details require an ID
const ChallengesIndexPage = () => {
    redirect("/");
};

export default ChallengesIndexPage;

