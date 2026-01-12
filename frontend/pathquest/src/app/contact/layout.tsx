import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contact Us | PathQuest",
    description:
        "Get in touch with the PathQuest team. Have a question, suggestion, or feedback? We'd love to hear from you.",
    openGraph: {
        title: "Contact Us | PathQuest",
        description:
            "Get in touch with the PathQuest team. Have a question, suggestion, or feedback? We'd love to hear from you.",
        type: "website",
        url: "https://pathquest.app/contact",
    },
    twitter: {
        card: "summary",
        title: "Contact Us | PathQuest",
        description: "Get in touch with the PathQuest team.",
    },
};

export default function ContactLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}

