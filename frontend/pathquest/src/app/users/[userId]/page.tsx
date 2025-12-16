import getUserProfile from "@/actions/users/getUserProfile";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import metersToFt from "@/helpers/metersToFt";

// Not statically generated (too many users, privacy concerns)
export const dynamic = "force-dynamic";

type Props = {
    params: {
        userId: string;
    };
};

// Generate dynamic metadata for SEO
export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
    const result = await getUserProfile(params.userId);

    if (!result.success || !result.data?.user) {
        return {
            title: "Profile Not Found | PathQuest",
            description: "The requested profile could not be found.",
        };
    }

    const { user, stats } = result.data;

    const title = `${user.name}'s Profile | PathQuest`;
    const description = `${user.name} has summited ${stats.totalPeaks || 0} peaks${stats.highestPeak ? `, including ${stats.highestPeak.name}` : ""}. View their accomplishments on PathQuest.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: "profile",
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
 * User Profile Page - Dynamic page for user profiles
 * 
 * This page provides:
 * 1. SEO metadata via generateMetadata
 * 2. Structured data (JSON-LD) for search engines
 * 3. Screen-reader accessible content
 * 
 * Privacy: The API returns 404 for private users if the requester is not the owner.
 * 
 * The visual overlay is rendered by UrlOverlayManager in the root layout,
 * which reads the pathname and shows the appropriate panel.
 * This ensures the Mapbox instance never reloads during navigation.
 */
const UserProfilePage = async ({ params }: Props) => {
    const { userId } = params;
    const result = await getUserProfile(userId);

    if (!result.success || !result.data?.user) {
        notFound();
    }

    const { user, stats, acceptedChallenges, peaksForMap } = result.data;

    // JSON-LD structured data for SEO
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        mainEntity: {
            "@type": "Person",
            name: user.name,
            ...(user.city || user.state || user.country ? {
                address: {
                    "@type": "PostalAddress",
                    addressLocality: user.city,
                    addressRegion: user.state,
                    addressCountry: user.country,
                },
            } : {}),
        },
        interactionStatistic: [
            {
                "@type": "InteractionCounter",
                interactionType: "https://schema.org/LikeAction",
                userInteractionCount: stats.totalPeaks,
                description: "Peaks Summited",
            },
            {
                "@type": "InteractionCounter",
                interactionType: "https://schema.org/FollowAction",
                userInteractionCount: stats.totalSummits,
                description: "Total Summits",
            },
        ],
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
            <article className="sr-only" aria-label={`Profile of ${user.name}`}>
                <h1>{user.name}&apos;s Profile</h1>
                
                <section aria-label="Statistics">
                    <h2>Accomplishments</h2>
                    <ul>
                        <li>{stats.totalPeaks || 0} peaks summited</li>
                        <li>{stats.totalSummits || 0} total summits</li>
                        <li>{stats.challengesCompleted || 0} challenges completed</li>
                        {stats.highestPeak && (
                            <li>
                                Highest peak: {stats.highestPeak.name} at{" "}
                                {Math.round(metersToFt(stats.highestPeak.elevation)).toLocaleString()} ft
                            </li>
                        )}
                        {stats.statesClimbed && stats.statesClimbed.length > 0 && (
                            <li>Climbed in {stats.statesClimbed.length} states</li>
                        )}
                    </ul>
                </section>

                {acceptedChallenges && acceptedChallenges.length > 0 && (
                    <section aria-label="Accepted challenges">
                        <h2>Accepted Challenges ({acceptedChallenges.length})</h2>
                        <ul>
                            {acceptedChallenges.map((challenge) => (
                                <li key={challenge.id}>
                                    <a href={`/challenges/${challenge.id}`}>
                                        {challenge.name} - {challenge.completed}/{challenge.total} peaks
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {peaksForMap && peaksForMap.length > 0 && (
                    <section aria-label="Summited peaks">
                        <h2>Summited Peaks ({peaksForMap.length})</h2>
                        <ul>
                            {peaksForMap.slice(0, 50).map((peak) => (
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

export default UserProfilePage;

