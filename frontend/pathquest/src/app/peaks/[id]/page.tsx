import getTopPeaks from "@/actions/peaks/getTopPeaks";
import getPeakDetails from "@/actions/peaks/getPeakDetails";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import metersToFt from "@/helpers/metersToFt";

// Generate static params for top 1000 peaks by summit count
export const generateStaticParams = async () => {
    const peaks = await getTopPeaks(1000);
    return peaks.map((p) => ({ id: p.id }));
};

// Allow on-demand generation for peaks not in top 1000
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
    const result = await getPeakDetails(id);

    if (!result.success || !result.data?.peak) {
        return {
            title: "Peak Not Found | PathQuest",
            description: "The requested peak could not be found.",
        };
    }

    const { peak } = result.data;
    const location = [peak.county, peak.state, peak.country].filter(Boolean).join(", ");
    const elevation = peak.elevation ? `${Math.round(metersToFt(peak.elevation)).toLocaleString()} ft` : "";
    const summitCount = peak.public_summits || 0;

    const title = `${peak.name}${elevation ? ` (${elevation})` : ""} | PathQuest`;
    const description = `Explore ${peak.name}${location ? ` in ${location}` : ""}${elevation ? `. Elevation: ${elevation}` : ""}. ${summitCount} recorded summits. Track your ascent and discover nearby challenges.`;

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
 * Static Peak Page - SEO-only content
 * 
 * This page provides:
 * 1. Static generation via generateStaticParams (top 1000 peaks)
 * 2. SEO metadata via generateMetadata
 * 3. Structured data (JSON-LD) for search engines
 * 4. Screen-reader accessible content
 * 
 * The visual overlay is rendered by UrlOverlayManager in the root layout,
 * which reads the pathname and shows the appropriate panel.
 * This ensures the Mapbox instance never reloads during navigation.
 */
const PeakPage = async ({ params }: Props) => {
    const { id } = await params;
    const result = await getPeakDetails(id);

    if (!result.success || !result.data?.peak) {
        notFound();
    }

    const { peak, publicSummits, challenges } = result.data;
    const location = [peak.county, peak.state, peak.country].filter(Boolean).join(", ");

    // Convert elevation to feet for display
    const elevationFt = peak.elevation ? Math.round(metersToFt(peak.elevation)) : 0;
    
    // JSON-LD structured data for SEO
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Place",
        name: peak.name,
        description: `Mountain peak${location ? ` located in ${location}` : ""}${peak.elevation ? `. Elevation: ${elevationFt.toLocaleString()} ft` : ""}.`,
        geo: peak.location_coords ? {
            "@type": "GeoCoordinates",
            latitude: peak.location_coords[1],
            longitude: peak.location_coords[0],
        } : undefined,
        ...(peak.elevation && {
            elevation: {
                "@type": "QuantitativeValue",
                value: elevationFt,
                unitCode: "FOT",
            },
        }),
        aggregateRating: peak.public_summits && peak.public_summits > 0 ? {
            "@type": "AggregateRating",
            ratingCount: peak.public_summits,
        } : undefined,
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
            <article className="sr-only" aria-label={`Details about ${peak.name}`}>
                <h1>{peak.name}</h1>
                {location && <p>Location: {location}</p>}
                {peak.elevation && <p>Elevation: {elevationFt.toLocaleString()} feet</p>}
                {peak.public_summits !== undefined && (
                    <p>{peak.public_summits} recorded summits</p>
                )}
                
                {challenges && challenges.length > 0 && (
                    <section aria-label="Related challenges">
                        <h2>Part of {challenges.length} Challenge{challenges.length !== 1 ? "s" : ""}</h2>
                        <ul>
                            {challenges.map((challenge) => (
                                <li key={challenge.id}>
                                    <a href={`/challenges/${challenge.id}`}>{challenge.name}</a>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
                
                {publicSummits && publicSummits.length > 0 && (
                    <section aria-label="Recent summits">
                        <h2>Recent Summits</h2>
                        <ul>
                            {publicSummits.slice(0, 10).map((summit, idx) => (
                                <li key={idx}>
                                    {summit.user_name || "Anonymous"} - {summit.timestamp ? new Date(summit.timestamp).toLocaleDateString() : "Date unknown"}
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </article>
        </>
    );
};

export default PeakPage;

