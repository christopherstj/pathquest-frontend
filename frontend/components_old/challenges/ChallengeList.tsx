"use client";
import getAllChallenges from "@/actions/challenges/getAllChallenges";
import { useChallengeDashboard } from "@/state_old/ChallengeDashboardContext";
import { GeoJSONSource } from "mapbox-gl";
import React from "react";
import { Virtuoso } from "react-virtuoso";
import ChallengeRow from "./ChallengeRow";
import ChallengeProgress from "@/typeDefs/ChallengeProgress";

const ChallengeList = () => {
    const [
        { map, limitToBbox, search, type, challenges },
        setChallengeDashboardState,
    ] = useChallengeDashboard();

    const [timeoutId, setTimeoutId] = React.useState<NodeJS.Timeout | null>(
        null
    );

    const refreshData = async () => {
        if (!map) return;

        const bbox = limitToBbox
            ? (map.getBounds()?.toArray() as [
                  [number, number],
                  [number, number]
              ])
            : null;
        const data = await getAllChallenges(
            type,
            bbox
                ? {
                      northwest: [bbox[0][1], bbox[1][0]],
                      southeast: [bbox[1][1], bbox[0][0]],
                  }
                : undefined,
            search
        );

        (map.getSource("challenges") as GeoJSONSource)?.setData({
            type: "FeatureCollection",
            features: data.map((d) => ({
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [d.centerLong ?? 0, d.centerLat ?? 0],
                },
                properties: {
                    ...d,
                },
            })),
        });

        setChallengeDashboardState((state) => ({
            ...state,
            challenges: data,
        }));
    };

    const onRowClick = (lat: number | undefined, long: number | undefined) => {
        if (!lat || !long || !map) return;
        map.flyTo({
            center: [long, lat],
            zoom: 14,
        });
    };

    React.useEffect(() => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        const id = setTimeout(refreshData, 500);

        setTimeoutId(id);

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [search, limitToBbox, type, map]);

    React.useEffect(() => {
        refreshData();
    }, [limitToBbox, type, map]);

    return (
        <Virtuoso
            className="challenge-list"
            data={challenges.sort(
                (a, b) =>
                    (a.total - a.completed) / a.total -
                    (b.total - b.completed) / b.total
            )}
            itemContent={(_, challenge) => (
                <ChallengeRow
                    challenge={challenge}
                    key={challenge.id}
                    onClick={onRowClick}
                    isVirtualized
                />
            )}
        />
    );
};

export default ChallengeList;
