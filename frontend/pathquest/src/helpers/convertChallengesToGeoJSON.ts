import ChallengeProgress from "@/typeDefs/ChallengeProgress";

const convertChallengesToGeoJSON = (
    challenges: ChallengeProgress[]
): GeoJSON.GeoJSON => {
    const features = challenges
        .filter((challenge) => {
            const hasCenter =
                challenge.center_lat !== undefined &&
                challenge.center_long !== undefined;
            const hasCoords =
                challenge.location_coords &&
                challenge.location_coords.length === 2;
            return hasCenter || hasCoords;
        })
        .map((challenge) => {
            const coordinates =
                challenge.location_coords ??
                ([challenge.center_long, challenge.center_lat] as [
                    number,
                    number
                ]);

            return {
                type: "Feature" as const,
                geometry: {
                    type: "Point" as const,
                    coordinates,
                },
                properties: {
                    ...challenge,
                },
            };
        });

    return {
        type: "FeatureCollection",
        features,
    };
};

export default convertChallengesToGeoJSON;












