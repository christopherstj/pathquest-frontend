import { Metadata } from "next";
import { notFound } from "next/navigation";
import getPublicLandDetail from "@/actions/conditions/getPublicLandDetail";
import { DESIGNATION_NAMES, MANAGER_NAMES } from "@/lib/public-land-utils";

export const dynamicParams = true;
export const revalidate = 86400;

type Props = {
    params: Promise<{
        objectId: string;
    }>;
};

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
    const { objectId } = await params;
    const detail = await getPublicLandDetail(objectId);

    if (!detail) {
        return {
            title: "Public Land Not Found | PathQuest",
            description: "The requested public land area could not be found.",
        };
    }

    const typeName = DESIGNATION_NAMES[detail.designationType] || detail.designationType;
    const managerName = MANAGER_NAMES[detail.manager] || detail.manager;

    const title = `${detail.name} | PathQuest`;
    const description = `Explore ${detail.name} (${typeName}), managed by ${managerName}. View conditions, peaks, and plan your trip on PathQuest.`;

    return {
        title,
        description,
        openGraph: { title, description, type: "website", siteName: "PathQuest" },
        twitter: { card: "summary_large_image", title, description },
    };
};

const PublicLandPage = async ({ params }: Props) => {
    const { objectId } = await params;
    const detail = await getPublicLandDetail(objectId);

    if (!detail) {
        notFound();
    }

    const typeName = DESIGNATION_NAMES[detail.designationType] || detail.designationType;
    const managerName = MANAGER_NAMES[detail.manager] || detail.manager;

    return (
        <article className="sr-only" aria-label={`Public land: ${detail.name}`}>
            <h1>{detail.name}</h1>
            <p>Type: {typeName}</p>
            <p>Managed by: {managerName}</p>
        </article>
    );
};

export default PublicLandPage;
