import { Metadata } from "next";
import { notFound } from "next/navigation";
import getFireDetail from "@/actions/conditions/getFireDetail";

export const dynamicParams = true;
export const revalidate = 3600;

type Props = {
    params: Promise<{
        incidentId: string;
    }>;
};

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
    const { incidentId } = await params;
    const detail = await getFireDetail(incidentId);

    if (!detail) {
        return {
            title: "Fire Not Found | PathQuest",
            description: "The requested fire incident could not be found.",
        };
    }

    const title = `${detail.name}${detail.state ? `, ${detail.state}` : ""} | PathQuest`;
    const parts: string[] = [];
    if (detail.acres) parts.push(`${detail.acres.toLocaleString()} acres`);
    if (detail.percentContained !== null) parts.push(`${detail.percentContained}% contained`);
    const description = `${detail.name} wildfire${detail.state ? ` in ${detail.state}` : ""}. ${parts.join(", ")}. View fire perimeter, nearby peaks, and conditions on PathQuest.`;

    return {
        title,
        description,
        openGraph: { title, description, type: "website", siteName: "PathQuest" },
        twitter: { card: "summary_large_image", title, description },
    };
};

const FirePage = async ({ params }: Props) => {
    const { incidentId } = await params;
    const detail = await getFireDetail(incidentId);

    if (!detail) {
        notFound();
    }

    return (
        <article className="sr-only" aria-label={`Fire: ${detail.name}`}>
            <h1>{detail.name}</h1>
            {detail.state && <p>State: {detail.state}</p>}
            {detail.incidentType && <p>Type: {detail.incidentType}</p>}
            {detail.acres && <p>Acreage: {detail.acres.toLocaleString()} acres</p>}
            {detail.percentContained !== null && <p>Containment: {detail.percentContained}%</p>}
            {detail.discoveredAt && <p>Discovered: {new Date(detail.discoveredAt).toLocaleDateString()}</p>}
            {detail.nearbyPeaks.length > 0 && (
                <section aria-label="Nearby peaks">
                    <h2>Nearby Peaks</h2>
                    <ul>
                        {detail.nearbyPeaks.map((peak) => (
                            <li key={peak.id}>
                                <a href={`/peaks/${peak.id}`}>{peak.name}</a> ({peak.distanceKm} km)
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </article>
    );
};

export default FirePage;
