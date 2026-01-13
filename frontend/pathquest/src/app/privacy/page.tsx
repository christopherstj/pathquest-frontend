import { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/brand/Logo";
import { ArrowLeft, Shield } from "lucide-react";

export const metadata: Metadata = {
    title: "Privacy Policy | PathQuest",
    description:
        "Learn how PathQuest collects, uses, and protects your personal information. Our commitment to your privacy and data security.",
    openGraph: {
        title: "Privacy Policy | PathQuest",
        description:
            "Learn how PathQuest collects, uses, and protects your personal information.",
        type: "website",
        url: "https://pathquest.app/privacy",
    },
};

export default function PrivacyPolicyPage() {
    const lastUpdated = "January 13, 2026";

    return (
        <div className="min-h-screen bg-background">
            {/* Header with back to app link */}
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
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
            <section className="py-12 px-6 border-b border-border/50">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Shield className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h1
                                className="text-3xl font-bold text-foreground"
                                style={{ fontFamily: "var(--font-display)" }}
                            >
                                Privacy Policy
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Last updated: {lastUpdated}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="py-12 px-6">
                <div className="max-w-4xl mx-auto prose prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground">
                    
                    <h2>Introduction</h2>
                    <p>
                        PathQuest ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and website (collectively, the "Service").
                    </p>
                    <p>
                        Please read this Privacy Policy carefully. By using the Service, you agree to the collection and use of information in accordance with this policy.
                    </p>

                    <h2>Information We Collect</h2>
                    
                    <h3>Information from Strava</h3>
                    <p>
                        When you connect your Strava account to PathQuest, we access the following information through Strava's API:
                    </p>
                    <ul>
                        <li><strong>Profile Information:</strong> Your name, profile photo, and athlete ID</li>
                        <li><strong>Activity Data:</strong> GPS coordinates, timestamps, elevation data, and activity metadata (title, type, distance, duration)</li>
                        <li><strong>Activity Visibility:</strong> Whether activities are public or private</li>
                    </ul>
                    <p>
                        We only access activities you've recorded on Strava. We do not access your Strava followers, following, or social interactions.
                    </p>

                    <h3>Information You Provide</h3>
                    <ul>
                        <li><strong>Trip Reports:</strong> Written descriptions, ratings, and conditions you add to your summits</li>
                        <li><strong>Photos:</strong> Images you upload to document your climbs</li>
                        <li><strong>Preferences:</strong> Settings like measurement units and notification preferences</li>
                        <li><strong>Contact Information:</strong> Email address if you contact us for support</li>
                    </ul>

                    <h3>Automatically Collected Information</h3>
                    <ul>
                        <li><strong>Device Information:</strong> Device type, operating system, and app version</li>
                        <li><strong>Usage Data:</strong> Features you use and how you interact with the Service</li>
                        <li><strong>Location Data:</strong> Approximate location when using map features (with your permission)</li>
                        <li><strong>Push Notification Tokens:</strong> Device identifiers for sending notifications (with your permission)</li>
                    </ul>

                    <h2>How We Use Your Information</h2>
                    <p>We use the information we collect to:</p>
                    <ul>
                        <li><strong>Provide the Service:</strong> Detect summits from your activities, track your progress on challenges, and display your climbing history</li>
                        <li><strong>Improve the Service:</strong> Analyze usage patterns to enhance features and fix issues</li>
                        <li><strong>Communicate:</strong> Send notifications about your summits and respond to support requests</li>
                        <li><strong>Display Community Features:</strong> Show public summit activity to other users (only for activities you've marked as public)</li>
                    </ul>

                    <h2>Information Sharing</h2>
                    <p>We do not sell your personal information. We may share information in the following circumstances:</p>
                    <ul>
                        <li><strong>Public Features:</strong> Summit activity, trip reports, and photos you mark as public are visible to other PathQuest users</li>
                        <li><strong>Service Providers:</strong> We use third-party services for hosting, analytics, and infrastructure (Google Cloud, Vercel, Mapbox)</li>
                        <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                    </ul>

                    <h2>Data Storage and Security</h2>
                    <p>
                        Your data is stored on secure servers provided by Google Cloud Platform. We implement industry-standard security measures including encryption in transit (HTTPS/TLS) and secure authentication.
                    </p>
                    <p>
                        While we strive to protect your information, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security.
                    </p>

                    <h2>Your Rights and Choices</h2>
                    <ul>
                        <li><strong>Disconnect Strava:</strong> You can disconnect your Strava account at any time through the app settings</li>
                        <li><strong>Delete Your Account:</strong> You can request deletion of your account and all associated data</li>
                        <li><strong>Privacy Settings:</strong> Control whether your profile and activities are public or private</li>
                        <li><strong>Notifications:</strong> Manage push notification preferences in the app settings</li>
                        <li><strong>Photo Permissions:</strong> Control access to your device's photo library through your device settings</li>
                    </ul>

                    <h2>Third-Party Services</h2>
                    <p>PathQuest integrates with the following third-party services:</p>
                    <ul>
                        <li><strong>Strava:</strong> For activity data (<a href="https://www.strava.com/legal/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Strava Privacy Policy</a>)</li>
                        <li><strong>Mapbox:</strong> For maps and location services (<a href="https://www.mapbox.com/legal/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Mapbox Privacy Policy</a>)</li>
                        <li><strong>Google Cloud:</strong> For data storage and processing</li>
                        <li><strong>Expo:</strong> For push notifications</li>
                    </ul>

                    <h2>Children's Privacy</h2>
                    <p>
                        PathQuest is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
                    </p>

                    <h2>Changes to This Policy</h2>
                    <p>
                        We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
                    </p>

                    <h2>Contact Us</h2>
                    <p>
                        If you have questions about this Privacy Policy or our privacy practices, please contact us at:
                    </p>
                    <ul>
                        <li>Email: <a href="mailto:privacy@pathquest.app" className="text-primary hover:underline">privacy@pathquest.app</a></li>
                        <li>Contact Form: <Link href="/contact" className="text-primary hover:underline">pathquest.app/contact</Link></li>
                    </ul>
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
                        <Link
                            href="/faq"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            FAQ
                        </Link>
                        <Link
                            href="/privacy"
                            className="text-foreground font-medium"
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
    );
}

