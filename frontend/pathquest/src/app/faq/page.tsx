"use client";

import React, { useState } from "react";
import Link from "next/link";
import Logo from "@/components/brand/Logo";
import { ChevronDown, HelpCircle, ArrowLeft } from "lucide-react";

// FAQ data organized by category
const faqCategories = [
    {
        title: "Getting Started",
        faqs: [
            {
                question: "What is PathQuest?",
                answer: "PathQuest is a platform for tracking mountain summits. It connects to your Strava account and automatically detects when you've summited a peak during your activities. You can discover new peaks, join challenges, and share your adventures with the community.",
            },
            {
                question: "Is PathQuest free to use?",
                answer: "Yes! PathQuest is free to use. Connect your Strava account and start tracking your summits right away. We may offer premium features in the future, but the core summit tracking functionality will always be free.",
            },
            {
                question: "Do I need a Strava account?",
                answer: "Yes, PathQuest requires a Strava account to track your summits. We use Strava's GPS data from your activities to detect when you've reached a peak. If you don't have a Strava account, you can create one for free at strava.com.",
            },
        ],
    },
    {
        title: "Strava Integration",
        faqs: [
            {
                question: "How does PathQuest connect to Strava?",
                answer: "PathQuest uses Strava's official OAuth system. When you click 'Connect with Strava', you'll be redirected to Strava to authorize PathQuest to read your activity data. We only request the permissions we need to detect summits.",
            },
            {
                question: "What Strava data does PathQuest access?",
                answer: "PathQuest accesses your activity GPS coordinates, timestamps, and basic activity information (title, type, distance). We do not access your personal information, social connections, or modify any of your Strava data without your explicit permission.",
            },
            {
                question: "Will PathQuest post to my Strava?",
                answer: "Only if you enable it. PathQuest can optionally add a summary of detected summits to your activity description. This is off by default and can be enabled in your settings.",
            },
            {
                question: "How do I disconnect my Strava account?",
                answer: "You can disconnect your Strava account from the Settings page. This will stop PathQuest from receiving new activities, but your existing summit data will be preserved unless you choose to delete your account.",
            },
        ],
    },
    {
        title: "Summit Detection",
        faqs: [
            {
                question: "How does summit detection work?",
                answer: "PathQuest analyzes the GPS coordinates from your Strava activities and compares them against our database of known peaks. When your track passes within a certain distance of a peak's summit and you spend time near the top, we record it as a summit.",
            },
            {
                question: "Why wasn't my summit detected?",
                answer: "Summit detection requires good GPS data near the peak. Common reasons for missed summits include: GPS signal issues, the peak not being in our database, or the activity being marked as private on Strava. You can always manually log summits that weren't auto-detected.",
            },
            {
                question: "Can I manually log a summit?",
                answer: "Yes! If you summited a peak but it wasn't automatically detected, you can manually log it from the peak's detail page. Click 'Log Summit' and select the date and activity (if applicable).",
            },
            {
                question: "How accurate is the summit detection?",
                answer: "Our detection algorithm is tuned to minimize false positives while catching legitimate summits. We use a combination of proximity to the peak, time spent near the summit, and GPS track analysis. For peaks with very close neighbors, we may flag summits for your review.",
            },
        ],
    },
    {
        title: "Challenges",
        faqs: [
            {
                question: "What are challenges?",
                answer: "Challenges are curated lists of peaks to climb, like the Colorado 14ers (all peaks over 14,000 feet in Colorado) or the New Hampshire 48 (the 48 peaks over 4,000 feet in NH). You can track your progress on any challenge by adding it to your favorites.",
            },
            {
                question: "How do I join a challenge?",
                answer: "Browse challenges from the Explore tab or search for a specific one. Click on a challenge to see its peaks and your progress, then click the heart icon to add it to your favorites. Your progress will be tracked automatically as you summit peaks.",
            },
            {
                question: "Can I create my own challenge?",
                answer: "Custom challenge creation is not currently available, but it's on our roadmap. If you have a suggestion for a challenge we should add, please contact us!",
            },
        ],
    },
    {
        title: "Privacy & Data",
        faqs: [
            {
                question: "Who can see my summits?",
                answer: "By default, your summits are public and appear in the community feed for each peak. You can make your profile private in Settings, which will hide your summits from other users while still tracking them for yourself.",
            },
            {
                question: "Can I delete my data?",
                answer: "Yes. You can delete individual summits, activities, or your entire account from the Settings page. Deleting your account permanently removes all your data from PathQuest.",
            },
            {
                question: "How is my data stored?",
                answer: "Your data is stored securely in our cloud database. We use industry-standard encryption and security practices. We never sell your data to third parties.",
            },
        ],
    },
];

// Generate FAQ schema for SEO
const generateFaqSchema = () => {
    const allFaqs = faqCategories.flatMap((category) => category.faqs);
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: allFaqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
            },
        })),
    };
};

// Accordion Item Component
const AccordionItem = ({
    question,
    answer,
    isOpen,
    onToggle,
}: {
    question: string;
    answer: string;
    isOpen: boolean;
    onToggle: () => void;
}) => {
    return (
        <div className="border-b border-border/50 last:border-b-0">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between py-4 text-left hover:text-primary transition-colors"
                aria-expanded={isOpen}
            >
                <span className="font-medium text-foreground pr-4">{question}</span>
                <ChevronDown
                    className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform ${
                        isOpen ? "rotate-180" : ""
                    }`}
                />
            </button>
            {isOpen && (
                <div className="pb-4 pr-8 animate-in fade-in slide-in-from-top-2 duration-200">
                    <p className="text-muted-foreground leading-relaxed">{answer}</p>
                </div>
            )}
        </div>
    );
};

export default function FAQPage() {
    const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

    const toggleItem = (key: string) => {
        setOpenItems((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    return (
        <>
            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(generateFaqSchema()),
                }}
            />

            <div className="min-h-screen bg-background">
                {/* Header with back to app link */}
                <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
                    <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-3">
                            <Logo size={32} className="text-primary" />
                            <span className="font-semibold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
                                PathQuest
                            </span>
                        </Link>
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to App
                        </Link>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="relative py-16 px-6 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
                    <div className="relative max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                            <HelpCircle className="w-5 h-5 text-primary" />
                            <span className="text-sm font-medium text-primary">
                                Help Center
                            </span>
                        </div>
                        <h1
                            className="text-4xl md:text-5xl font-bold text-foreground mb-4"
                            style={{ fontFamily: "var(--font-display)" }}
                        >
                            Frequently Asked Questions
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Find answers to common questions about PathQuest, summit
                            tracking, and Strava integration.
                        </p>
                    </div>
                </section>

                {/* FAQ Content */}
                <section className="py-12 px-6">
                    <div className="max-w-3xl mx-auto">
                        {faqCategories.map((category) => (
                            <div key={category.title} className="mb-10">
                                <h2
                                    className="text-2xl font-bold text-foreground mb-6"
                                    style={{ fontFamily: "var(--font-display)" }}
                                >
                                    {category.title}
                                </h2>
                                <div className="bg-card rounded-xl border border-border/70 px-6">
                                    {category.faqs.map((faq, index) => {
                                        const key = `${category.title}-${index}`;
                                        return (
                                            <AccordionItem
                                                key={key}
                                                question={faq.question}
                                                answer={faq.answer}
                                                isOpen={openItems[key] || false}
                                                onToggle={() => toggleItem(key)}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Contact CTA */}
                <section className="py-12 px-6 bg-muted/20 border-t border-border/50">
                    <div className="max-w-2xl mx-auto text-center">
                        <h2
                            className="text-2xl font-bold text-foreground mb-4"
                            style={{ fontFamily: "var(--font-display)" }}
                        >
                            Still Have Questions?
                        </h2>
                        <p className="text-muted-foreground mb-6">
                            Can't find what you're looking for? We're here to help.
                        </p>
                        <Link
                            href="/contact"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                        >
                            Contact Us
                        </Link>
                    </div>
                </section>

                {/* Footer Navigation */}
                <footer className="py-8 px-6 border-t border-border/50">
                    <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                        <nav className="flex items-center gap-6 text-sm">
                            <Link
                                href="/about"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                About
                            </Link>
                            <Link href="/faq" className="text-foreground font-medium">
                                FAQ
                            </Link>
                            <Link
                                href="/privacy"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Privacy
                            </Link>
                            <Link
                                href="/terms"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Terms
                            </Link>
                            <Link
                                href="/contact"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Contact
                            </Link>
                        </nav>
                        <p className="text-sm text-muted-foreground">
                            &copy; {new Date().getFullYear()} PathQuest
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}

