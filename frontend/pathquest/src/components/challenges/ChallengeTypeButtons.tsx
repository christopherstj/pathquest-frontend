"use client";
import getAllChallenges from "@/actions/getAllChallenges";
import { useChallengeDashboard } from "@/state/ChallengeDashboardContext";
import { Button, ButtonGroup, SxProps } from "@mui/material";
import React, { useCallback } from "react";

const buttonGroupStyles: SxProps = {
    borderRadius: "24px",
    borderColor: "primary.onContainer",
};

const buttonStyles = (selected: boolean): SxProps => ({
    borderRadius: "24px",
    borderColor: "primary.onContainer",
    backgroundColor: selected ? "primary.onContainer" : "transparent",
    color: selected ? "primary.container" : "primary.onContainer",
});

const ChallengeTypeButtons = () => {
    const [{ map, search, limitToBbox, type }, setChallengeDashboardState] =
        useChallengeDashboard();

    const handleClick = (type: "completed" | "in-progress" | "not-started") => {
        setChallengeDashboardState((state) => ({
            ...state,
            type,
        }));
    };

    const getNewData = useCallback(
        async (e?: { target?: mapboxgl.Map }) => {
            const bounds = limitToBbox ? (map ?? e?.target)?.getBounds() : null;

            const data = await getAllChallenges(
                type,
                bounds
                    ? {
                          northwest: [
                              bounds?.getNorthWest().lat ?? 0,
                              bounds?.getNorthWest().lng ?? 0,
                          ],
                          southeast: [
                              bounds?.getSouthEast().lat ?? 0,
                              bounds?.getSouthEast().lng ?? 0,
                          ],
                      }
                    : undefined,
                search
            );

            (
                (map ?? e?.target)?.getSource(
                    "challenges"
                ) as mapboxgl.GeoJSONSource
            )?.setData({
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
        },
        [map, search, limitToBbox, type, setChallengeDashboardState]
    );

    React.useEffect(() => {
        if (map) {
            map?.on("moveend", getNewData);
        }
        return () => {
            map?.off("moveend", getNewData);
        };
    }, [map, getNewData]);

    return (
        <ButtonGroup
            variant="outlined"
            fullWidth
            aria-label="Basic button group"
            sx={buttonGroupStyles}
        >
            <Button
                sx={buttonStyles(type === "in-progress")}
                onClick={(e) => handleClick("in-progress")}
            >
                In Progress
            </Button>
            <Button
                sx={buttonStyles(type === "not-started")}
                onClick={(e) => handleClick("not-started")}
            >
                Not Started
            </Button>
            <Button
                sx={buttonStyles(type === "completed")}
                onClick={(e) => handleClick("completed")}
            >
                Completed
            </Button>
        </ButtonGroup>
    );
};

export default ChallengeTypeButtons;
