import { Metadata } from "next";

export const metadata: Metadata = {
    title: "FAQ | PathQuest - Peak Bagging & Summit Tracking",
    description:
        "Find answers to frequently asked questions about PathQuest, summit tracking, Strava integration, challenges, and more.",
    openGraph: {
        title: "FAQ | PathQuest - Peak Bagging & Summit Tracking",
        description:
            "Find answers to frequently asked questions about PathQuest, summit tracking, Strava integration, challenges, and more.",
        type: "website",
        url: "https://pathquest.app/faq",
    },
    twitter: {
        card: "summary",
        title: "FAQ | PathQuest",
        description:
            "Find answers to frequently asked questions about PathQuest.",
    },
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
    return children;
}

