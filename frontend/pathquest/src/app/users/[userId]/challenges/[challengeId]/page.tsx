import getUserChallengeProgress from "@/actions/users/getUserChallengeProgress";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import metersToFt from "@/helpers/metersToFt";

// Not statically generated (dynamic user data)
export const dynamic = "force-dynamic";

type Props = {
    params: Promise<{
        userId: string;
        challengeId: string;
    }>;
};

// Generate dynamic metadata for SEO
export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
    const { userId, challengeId } = await params;
    const result = await getUserChallengeProgress(userId, challengeId);

    if (!result.success || !result.data) {
        return {
            title: "Challenge Progress Not Found | PathQuest",
            description: "The requested challenge progress could not be found.",
        };
    }

    const { challenge, progress, user } = result.data;
    const progressPercent = progress.total > 0 
        ? Math.round((progress.completed / progress.total) * 100) 
        : 0;

    const title = `${user.name}'s Progress on ${challenge.name} | PathQuest`;
    const description = `${user.name} has completed ${progress.completed} of ${progress.total} peaks (${progressPercent}%) in the ${challenge.name} challenge. View their progress on PathQuest.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: "website",
            siteName: "PathQuest",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
        },
    };
};

/**
 * User Challenge Progress Page
 * 
 * Shows a specific user's progress on a challenge.
 * 
 * This page provides:
 * 1. SEO metadata via generateMetadata
 * 2. Structured data (JSON-LD) for search engines
 * 3. Screen-reader accessible content
 * 
 * The visual UI is rendered by ExploreTabContent which detects the pathname pattern.
 */
const UserChallengePage = async ({ params }: Props) => {
    const { userId, challengeId } = await params;
    const result = await getUserChallengeProgress(userId, challengeId);

    if (!result.success || !result.data) {
        notFound();
    }

    const { challenge, progress, peaks, user } = result.data;
    const progressPercent = progress.total > 0 
        ? Math.round((progress.completed / progress.total) * 100) 
        : 0;
    const summitedPeaks = peaks.filter(p => p.is_summited);

    // JSON-LD structured data for SEO
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: `${user.name}'s Progress on ${challenge.name}`,
        description: `${progress.completed} of ${progress.total} peaks completed`,
        numberOfItems: peaks.length,
        itemListElement: summitedPeaks.slice(0, 50).map((peak, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
                "@type": "Place",
                name: peak.name,
                geo: peak.location_coords ? {
                    "@type": "GeoCoordinates",
                    latitude: peak.location_coords[1],
                    longitude: peak.location_coords[0],
                } : undefined,
            },
        })),
    };

    return (
        <>
            {/* JSON-LD Structured Data for Search Engines */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />
            
            {/* 
                SEO-friendly content - visually hidden but accessible to:
                - Search engine crawlers
                - Screen readers
                - Users with CSS disabled
            */}
            <article className="sr-only" aria-label={`${user.name}'s progress on ${challenge.name}`}>
                <h1>{user.name}&apos;s Progress on {challenge.name}</h1>
                
                <section aria-label="Progress summary">
                    <h2>Progress</h2>
                    <p>
                        {progress.completed} of {progress.total} peaks completed ({progressPercent}%)
                    </p>
                    {progress.lastProgressDate && (
                        <p>Last progress: {new Date(progress.lastProgressDate).toLocaleDateString()}</p>
                    )}
                </section>

                <section aria-label="Peaks in challenge">
                    <h2>Peaks ({peaks.length})</h2>
                    
                    <h3>Summited ({summitedPeaks.length})</h3>
                    <ul>
                        {summitedPeaks.map((peak) => (
                            <li key={peak.id}>
                                <a href={`/peaks/${peak.id}`}>
                                    {peak.name}
                                    {peak.elevation && ` - ${Math.round(metersToFt(peak.elevation)).toLocaleString()} ft`}
                                </a>
                                {peak.summit_date && ` (${new Date(peak.summit_date).toLocaleDateString()})`}
                            </li>
                        ))}
                    </ul>

                    <h3>Remaining ({peaks.length - summitedPeaks.length})</h3>
                    <ul>
                        {peaks.filter(p => !p.is_summited).map((peak) => (
                            <li key={peak.id}>
                                <a href={`/peaks/${peak.id}`}>
                                    {peak.name}
                                    {peak.elevation && ` - ${Math.round(metersToFt(peak.elevation)).toLocaleString()} ft`}
                                </a>
                            </li>
                        ))}
                    </ul>
                </section>
            </article>
        </>
    );
};

export default UserChallengePage;

