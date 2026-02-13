import { Metadata } from "next";
import { notFound } from "next/navigation";
import getAvalancheZoneDetail from "@/actions/conditions/getAvalancheZoneDetail";

export const dynamicParams = true;
export const revalidate = 900;

type Props = {
    params: Promise<{
        centerId: string;
        zoneId: string;
    }>;
};

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
    const { centerId, zoneId } = await params;
    const detail = await getAvalancheZoneDetail(centerId, zoneId);

    if (!detail) {
        return {
            title: "Avalanche Zone Not Found | PathQuest",
            description: "The requested avalanche zone could not be found.",
        };
    }

    const todayDanger = detail.danger?.[0];
    const maxDanger = todayDanger
        ? Math.max(todayDanger.upper, todayDanger.middle, todayDanger.lower)
        : 0;
    const dangerLabels = ["No Rating", "Low", "Moderate", "Considerable", "High", "Extreme"];

    const title = `${detail.zoneName} - ${detail.centerName} | PathQuest`;
    const description = `Avalanche forecast for ${detail.zoneName} (${detail.centerName}). Current danger: ${dangerLabels[maxDanger] || "Unknown"}. View elevation band details, problems, and nearby peaks on PathQuest.`;

    return {
        title,
        description,
        openGraph: { title, description, type: "website", siteName: "PathQuest" },
        twitter: { card: "summary_large_image", title, description },
    };
};

const AvalancheZonePage = async ({ params }: Props) => {
    const { centerId, zoneId } = await params;
    const detail = await getAvalancheZoneDetail(centerId, zoneId);

    if (!detail) {
        notFound();
    }

    const todayDanger = detail.danger?.[0];
    const dangerLabels = ["No Rating", "Low", "Moderate", "Considerable", "High", "Extreme"];

    return (
        <article className="sr-only" aria-label={`Avalanche zone: ${detail.zoneName}`}>
            <h1>{detail.zoneName}</h1>
            <p>Center: {detail.centerName}</p>
            {todayDanger && (
                <section aria-label="Danger levels">
                    <h2>Danger Levels</h2>
                    <ul>
                        <li>Alpine: {dangerLabels[todayDanger.upper] || "Unknown"}</li>
                        <li>Treeline: {dangerLabels[todayDanger.middle] || "Unknown"}</li>
                        <li>Below Treeline: {dangerLabels[todayDanger.lower] || "Unknown"}</li>
                    </ul>
                </section>
            )}
            {detail.problems && detail.problems.length > 0 && (
                <section aria-label="Avalanche problems">
                    <h2>Avalanche Problems</h2>
                    <ul>
                        {detail.problems.map((p: any, i: number) => (
                            <li key={i}>{p.name}{p.likelihood ? ` - ${p.likelihood}` : ""}</li>
                        ))}
                    </ul>
                </section>
            )}
            {detail.forecastUrl && (
                <p><a href={detail.forecastUrl}>View full forecast</a></p>
            )}
            {detail.nearbyPeaks.length > 0 && (
                <section aria-label="Nearby peaks">
                    <h2>Nearby Peaks</h2>
                    <ul>
                        {detail.nearbyPeaks.map((peak) => (
                            <li key={peak.id}>
                                <a href={`/peaks/${peak.id}`}>{peak.name}</a>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </article>
    );
};

export default AvalancheZonePage;
