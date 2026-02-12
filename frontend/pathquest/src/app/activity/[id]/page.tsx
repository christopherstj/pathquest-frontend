import { Metadata } from "next";
import { notFound } from "next/navigation";
import getPublicActivity from "@/actions/activities/getPublicActivity";
import PublicActivityPage from "@/components/pages/PublicActivityPage";

type Props = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const resolvedParams = await params;
    const activity = await getPublicActivity(resolvedParams.id);

    if (!activity) {
        return {
            title: "Activity Not Found | PathQuest",
        };
    }

    const title = activity.display_title || "Activity Report";
    const description = activity.trip_report 
        ? activity.trip_report.slice(0, 160) 
        : `Trip report from ${new Date(activity.start_time).toLocaleDateString()}`;

    return {
        title: `${title} | PathQuest`,
        description,
        openGraph: {
            title,
            description,
            type: "article",
        },
    };
}

export default async function Page({ params }: Props) {
    const resolvedParams = await params;
    const activity = await getPublicActivity(resolvedParams.id);

    if (!activity) {
        notFound();
    }

    return <PublicActivityPage activity={activity} />;
}
