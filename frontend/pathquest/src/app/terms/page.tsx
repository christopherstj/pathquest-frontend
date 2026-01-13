import { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/brand/Logo";
import { ArrowLeft, FileText } from "lucide-react";

export const metadata: Metadata = {
    title: "Terms of Service | PathQuest",
    description:
        "Terms of Service for PathQuest. Please read these terms carefully before using our peak tracking and summit logging service.",
    openGraph: {
        title: "Terms of Service | PathQuest",
        description:
            "Terms of Service for PathQuest. Please read these terms carefully before using our service.",
        type: "website",
        url: "https://pathquest.app/terms",
    },
};

export default function TermsOfServicePage() {
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
                            <FileText className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h1
                                className="text-3xl font-bold text-foreground"
                                style={{ fontFamily: "var(--font-display)" }}
                            >
                                Terms of Service
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
                    
                    <h2>1. Acceptance of Terms</h2>
                    <p>
                        By accessing or using PathQuest ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the Service.
                    </p>
                    <p>
                        PathQuest is operated by PathQuest ("we," "us," or "our"). These Terms apply to all users of the Service, including the website and mobile applications.
                    </p>

                    <h2>2. Description of Service</h2>
                    <p>
                        PathQuest is a peak bagging and summit tracking platform that:
                    </p>
                    <ul>
                        <li>Automatically detects mountain summits from your Strava activities</li>
                        <li>Tracks your progress on climbing challenges and goals</li>
                        <li>Provides information about peaks including location, elevation, and public lands</li>
                        <li>Allows you to share trip reports, photos, and conditions</li>
                        <li>Connects you with a community of peak baggers</li>
                    </ul>

                    <h2>3. Account Registration</h2>
                    <p>
                        To use PathQuest, you must connect a valid Strava account. By connecting your Strava account, you:
                    </p>
                    <ul>
                        <li>Authorize us to access your Strava activity data as described in our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link></li>
                        <li>Confirm that you are at least 13 years of age</li>
                        <li>Agree to provide accurate information</li>
                        <li>Are responsible for maintaining the security of your account</li>
                    </ul>

                    <h2>4. Acceptable Use</h2>
                    <p>You agree not to:</p>
                    <ul>
                        <li>Use the Service for any unlawful purpose</li>
                        <li>Upload false, misleading, or fraudulent activity data</li>
                        <li>Harass, abuse, or harm other users</li>
                        <li>Upload content that infringes on others' intellectual property rights</li>
                        <li>Attempt to gain unauthorized access to the Service or its systems</li>
                        <li>Use automated tools to scrape or collect data from the Service</li>
                        <li>Interfere with the proper functioning of the Service</li>
                    </ul>

                    <h2>5. User Content</h2>
                    <p>
                        You retain ownership of content you create on PathQuest, including trip reports, photos, and comments ("User Content"). By posting User Content, you grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content in connection with the Service.
                    </p>
                    <p>
                        You are solely responsible for your User Content. We reserve the right to remove any content that violates these Terms or is otherwise objectionable.
                    </p>

                    <h2>6. Strava Integration</h2>
                    <p>
                        PathQuest relies on Strava's API to access your activity data. Your use of Strava is governed by Strava's own Terms of Service and Privacy Policy. We are not responsible for:
                    </p>
                    <ul>
                        <li>Changes to Strava's API or service availability</li>
                        <li>Accuracy of data provided by Strava</li>
                        <li>Issues arising from your Strava account</li>
                    </ul>

                    <h2>7. Summit Detection Accuracy</h2>
                    <p>
                        PathQuest uses algorithms to detect when you've summited a peak based on GPS data. While we strive for accuracy, summit detection is not guaranteed to be 100% accurate due to:
                    </p>
                    <ul>
                        <li>GPS signal accuracy and device limitations</li>
                        <li>Variations in peak location data</li>
                        <li>Activity recording quality</li>
                    </ul>
                    <p>
                        You can manually confirm, reject, or add summits to correct any detection errors.
                    </p>

                    <h2>8. Safety Disclaimer</h2>
                    <p>
                        <strong>Mountain climbing and hiking involve inherent risks.</strong> PathQuest provides information about peaks and routes for informational purposes only. We do not:
                    </p>
                    <ul>
                        <li>Guarantee the accuracy of peak locations, elevations, or conditions</li>
                        <li>Provide route-finding or navigation advice</li>
                        <li>Assess the safety or difficulty of any climb</li>
                        <li>Replace proper preparation, training, and judgment</li>
                    </ul>
                    <p>
                        You are solely responsible for your safety when climbing. Always check current conditions, weather forecasts, and assess your abilities before attempting any climb.
                    </p>

                    <h2>9. Intellectual Property</h2>
                    <p>
                        The Service, including its design, features, and content (excluding User Content), is owned by PathQuest and protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, or distribute any part of the Service without our written permission.
                    </p>

                    <h2>10. Termination</h2>
                    <p>
                        We may suspend or terminate your access to the Service at any time, with or without cause, with or without notice. You may delete your account at any time through the app settings.
                    </p>
                    <p>
                        Upon termination, your right to use the Service will immediately cease. Provisions of these Terms that by their nature should survive termination will survive.
                    </p>

                    <h2>11. Disclaimer of Warranties</h2>
                    <p>
                        THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                    </p>
                    <p>
                        We do not warrant that the Service will be uninterrupted, error-free, or free of viruses or other harmful components.
                    </p>

                    <h2>12. Limitation of Liability</h2>
                    <p>
                        TO THE MAXIMUM EXTENT PERMITTED BY LAW, PATHQUEST SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR USE, ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE.
                    </p>
                    <p>
                        IN NO EVENT SHALL OUR TOTAL LIABILITY EXCEED THE AMOUNT YOU PAID US, IF ANY, IN THE PAST TWELVE MONTHS.
                    </p>

                    <h2>13. Indemnification</h2>
                    <p>
                        You agree to indemnify and hold harmless PathQuest and its officers, directors, employees, and agents from any claims, damages, losses, or expenses (including reasonable attorney's fees) arising from your use of the Service or violation of these Terms.
                    </p>

                    <h2>14. Changes to Terms</h2>
                    <p>
                        We reserve the right to modify these Terms at any time. We will notify you of material changes by posting the updated Terms on this page and updating the "Last updated" date. Your continued use of the Service after changes constitutes acceptance of the new Terms.
                    </p>

                    <h2>15. Governing Law</h2>
                    <p>
                        These Terms shall be governed by and construed in accordance with the laws of the State of California, United States, without regard to its conflict of law provisions.
                    </p>

                    <h2>16. Contact Information</h2>
                    <p>
                        If you have questions about these Terms, please contact us at:
                    </p>
                    <ul>
                        <li>Email: <a href="mailto:legal@pathquest.app" className="text-primary hover:underline">legal@pathquest.app</a></li>
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
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Privacy
                        </Link>
                        <Link
                            href="/terms"
                            className="text-foreground font-medium"
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

