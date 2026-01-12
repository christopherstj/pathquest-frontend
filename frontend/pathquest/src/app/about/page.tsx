import { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/brand/Logo";
import { Zap, Trophy, Users, MapPin, Activity, ArrowLeft, Mountain } from "lucide-react";

export const metadata: Metadata = {
    title: "About PathQuest | Peak Bagging & Summit Tracking",
    description:
        "PathQuest automatically tracks your mountain summits from Strava activities. Discover peaks, join challenges, and connect with the peak bagging community.",
    openGraph: {
        title: "About PathQuest | Peak Bagging & Summit Tracking",
        description:
            "PathQuest automatically tracks your mountain summits from Strava activities. Discover peaks, join challenges, and connect with the peak bagging community.",
        type: "website",
        url: "https://pathquest.app/about",
    },
    twitter: {
        card: "summary_large_image",
        title: "About PathQuest | Peak Bagging & Summit Tracking",
        description:
            "PathQuest automatically tracks your mountain summits from Strava activities.",
    },
};

// Schema.org structured data for WebApplication
const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "PathQuest",
    description:
        "PathQuest automatically tracks your mountain summits from Strava activities. Discover peaks, join challenges, and connect with the peak bagging community.",
    url: "https://pathquest.app",
    applicationCategory: "SportsApplication",
    operatingSystem: "Web",
    offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
    },
    featureList: [
        "Automatic summit detection from Strava activities",
        "Peak discovery and exploration",
        "Climbing challenges and goals",
        "Community summit sharing",
        "Weather conditions at summit time",
        "Trip reports and photos",
    ],
};

const features = [
    {
        icon: Zap,
        title: "Automatic Summit Detection",
        description:
            "Connect your Strava account and we'll automatically detect when you summit peaks during your activities. No manual logging required.",
    },
    {
        icon: MapPin,
        title: "Discover New Peaks",
        description:
            "Explore an interactive map with thousands of peaks. Find your next adventure based on location, elevation, or popularity.",
    },
    {
        icon: Trophy,
        title: "Join Challenges",
        description:
            "Take on peak bagging challenges like the Colorado 14ers, New Hampshire 48, or create your own goals. Track your progress as you climb.",
    },
    {
        icon: Users,
        title: "Community",
        description:
            "See who else has summited your favorite peaks. Share trip reports, photos, and conditions to help fellow climbers.",
    },
    {
        icon: Activity,
        title: "Weather & Conditions",
        description:
            "View historical weather data for each summit. Log conditions like snow, wind, or clear skies to help others plan their trips.",
    },
    {
        icon: Mountain,
        title: "Public Lands Info",
        description:
            "Know where you're climbing. See which National Parks, Wilderness Areas, or National Forests your peaks are located in.",
    },
];

const steps = [
    {
        number: "1",
        title: "Connect Strava",
        description:
            "Link your Strava account with one click. We'll import your historical activities and watch for new ones.",
    },
    {
        number: "2",
        title: "Go Climb",
        description:
            "Head out on your favorite trails and bag some peaks. Record your activity on Strava as usual.",
    },
    {
        number: "3",
        title: "Track Progress",
        description:
            "PathQuest automatically detects your summits and adds them to your logbook. Watch your peak count grow!",
    },
];

export default function AboutPage() {
    return (
        <>
            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
                <section className="relative py-20 px-6 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
                    <div className="relative max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                            <Logo size={20} className="text-primary" />
                            <span className="text-sm font-medium text-primary">
                                Peak Bagging Made Simple
                            </span>
                        </div>
                        <h1
                            className="text-4xl md:text-5xl font-bold text-foreground mb-6"
                            style={{ fontFamily: "var(--font-display)" }}
                        >
                            Track Your Summit Adventures
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                            PathQuest automatically tracks your mountain summits from
                            Strava activities. Discover peaks, join challenges, and
                            connect with the peak bagging community.
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                        >
                            <MapPin className="w-5 h-5" />
                            Explore the Map
                        </Link>
                    </div>
                </section>

                {/* What is PathQuest */}
                <section className="py-16 px-6 border-t border-border/50">
                    <div className="max-w-4xl mx-auto">
                        <h2
                            className="text-3xl font-bold text-foreground mb-6 text-center"
                            style={{ fontFamily: "var(--font-display)" }}
                        >
                            What is PathQuest?
                        </h2>
                        <div className="prose prose-invert max-w-none text-muted-foreground">
                            <p className="text-lg leading-relaxed">
                                PathQuest is a platform for peak baggers and mountain
                                enthusiasts who want to track their summit achievements.
                                Whether you're working on the Colorado 14ers, exploring
                                local hills, or chasing peaks around the world, PathQuest
                                helps you keep track of where you've been and discover
                                where to go next.
                            </p>
                            <p className="text-lg leading-relaxed mt-4">
                                By connecting to Strava, PathQuest automatically analyzes
                                your GPS tracks to detect when you've summited a peak. No
                                more manually logging each climb or wondering if you
                                actually made it to the top—we handle it all for you.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="py-16 px-6 bg-muted/20 border-t border-border/50">
                    <div className="max-w-6xl mx-auto">
                        <h2
                            className="text-3xl font-bold text-foreground mb-12 text-center"
                            style={{ fontFamily: "var(--font-display)" }}
                        >
                            Key Features
                        </h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {features.map((feature) => (
                                <div
                                    key={feature.title}
                                    className="p-6 rounded-xl bg-card border border-border/70 hover:border-primary/30 transition-colors"
                                >
                                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                                        <feature.icon className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-foreground mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-muted-foreground">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className="py-16 px-6 border-t border-border/50">
                    <div className="max-w-4xl mx-auto">
                        <h2
                            className="text-3xl font-bold text-foreground mb-12 text-center"
                            style={{ fontFamily: "var(--font-display)" }}
                        >
                            How It Works
                        </h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            {steps.map((step) => (
                                <div key={step.number} className="text-center">
                                    <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mx-auto mb-4">
                                        <span
                                            className="text-2xl font-bold text-primary"
                                            style={{ fontFamily: "var(--font-display)" }}
                                        >
                                            {step.number}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-foreground mb-2">
                                        {step.title}
                                    </h3>
                                    <p className="text-muted-foreground">
                                        {step.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-16 px-6 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 border-t border-border/50">
                    <div className="max-w-2xl mx-auto text-center">
                        <h2
                            className="text-2xl font-bold text-foreground mb-4"
                            style={{ fontFamily: "var(--font-display)" }}
                        >
                            Ready to Start Tracking?
                        </h2>
                        <p className="text-muted-foreground mb-6">
                            Connect your Strava account and start building your summit
                            logbook today. It's free to get started.
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                        >
                            Get Started
                        </Link>
                    </div>
                </section>

                {/* Footer Navigation */}
                <footer className="py-8 px-6 border-t border-border/50">
                    <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                        <nav className="flex items-center gap-6 text-sm">
                            <Link
                                href="/about"
                                className="text-foreground font-medium"
                            >
                                About
                            </Link>
                            <Link
                                href="/faq"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                FAQ
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

