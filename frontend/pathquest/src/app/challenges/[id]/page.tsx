import getAllChallengeIds from "@/actions/challenges/getAllChallengeIds";
import getPublicChallengeDetails from "@/actions/challenges/getPublicChallengeDetails";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import metersToFt from "@/helpers/metersToFt";

// Generate static params for all challenges
export const generateStaticParams = async () => {
    const challenges = await getAllChallengeIds();
    return challenges.map((c) => ({ id: String(c.id) }));
};

// Allow on-demand generation for any new challenges
export const dynamicParams = true;

// Revalidate every 24 hours
export const revalidate = 86400;

type Props = {
    params: Promise<{
        id: string;
    }>;
};

// Generate dynamic metadata for SEO
export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
    const { id } = await params;
    const result = await getPublicChallengeDetails(id);

    if (!result.success || !result.data?.challenge) {
        return {
            title: "Challenge Not Found | PathQuest",
            description: "The requested challenge could not be found.",
        };
    }

    const { challenge, peaks } = result.data;
    const peakCount = peaks?.length || challenge.num_peaks || 0;

    const title = `${challenge.name} Challenge | PathQuest`;
    const description = `Take on the ${challenge.name} challenge${challenge.region ? ` in ${challenge.region}` : ""}. ${peakCount} peaks to conquer. Track your progress and compete with other peak baggers.`;

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
 * Static Challenge Page - SEO-only content
 * 
 * This page provides:
 * 1. Static generation via generateStaticParams (all challenges)
 * 2. SEO metadata via generateMetadata
 * 3. Structured data (JSON-LD) for search engines
 * 4. Screen-reader accessible content
 * 
 * The visual overlay is rendered by UrlOverlayManager in the root layout,
 * which reads the pathname and shows the appropriate panel.
 * This ensures the Mapbox instance never reloads during navigation.
 */
const ChallengePage = async ({ params }: Props) => {
    const { id } = await params;
    const result = await getPublicChallengeDetails(id);

    if (!result.success || !result.data?.challenge) {
        notFound();
    }

    const { challenge, peaks } = result.data;
    const peakCount = peaks?.length || challenge.num_peaks || 0;

    // JSON-LD structured data for SEO
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "SportsEvent",
        name: `${challenge.name} Challenge`,
        description: `A peak bagging challenge${challenge.region ? ` in ${challenge.region}` : ""} with ${peakCount} peaks to conquer.`,
        location: challenge.region ? {
            "@type": "Place",
            name: challenge.region,
        } : undefined,
        organizer: {
            "@type": "Organization",
            name: "PathQuest",
            url: "https://pathquest.io",
        },
        ...(peaks && peaks.length > 0 && {
            subEvent: peaks.slice(0, 50).map((peak) => ({
                "@type": "Place",
                name: peak.name,
                geo: peak.location_coords ? {
                    "@type": "GeoCoordinates",
                    latitude: peak.location_coords[1],
                    longitude: peak.location_coords[0],
                } : undefined,
            })),
        }),
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
            <article className="sr-only" aria-label={`Details about ${challenge.name} Challenge`}>
                <h1>{challenge.name} Challenge</h1>
                {challenge.region && <p>Region: {challenge.region}</p>}
                <p>{peakCount} peaks to summit</p>
                
                {/* {challenge.description && (
                    <section aria-label="Challenge description">
                        <h2>About this Challenge</h2>
                        <p>{challenge.description}</p>
                    </section>
                )}
                 */}
                {peaks && peaks.length > 0 && (
                    <section aria-label="Peaks in this challenge">
                        <h2>Peaks in this Challenge ({peaks.length})</h2>
                        <ul>
                            {[...peaks].sort((a, b) => (b.elevation || 0) - (a.elevation || 0)).map((peak) => (
                                <li key={peak.id}>
                                    <a href={`/peaks/${peak.id}`}>
                                        {peak.name}
                                        {peak.elevation && ` - ${Math.round(metersToFt(peak.elevation)).toLocaleString()} ft`}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </article>
        </>
    );
};

export default ChallengePage;

