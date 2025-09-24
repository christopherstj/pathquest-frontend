"use client";
import { useActivities } from "@/state_old/ActivitiesContext";
import { useMessage } from "@/state_old/MessageContext";
import { Box, LinearProgress } from "@mui/material";
import React from "react";
import getNewData from "./helpers/getNewData";
import { Virtuoso } from "react-virtuoso";
import ActivityRow from "../peaks/ActivityRow";
import { useUser } from "@/state_old/UserContext";
import getCoords from "./helpers/getCoords";
import clearCoords from "./helpers/clearCoords";

const ActivitiesList = () => {
    const [
        { activityStarts, search, limitToBbox, map, loading },
        setActivitiesState,
    ] = useActivities();
    const [, dispatch] = useMessage();
    const [{ user }] = useUser();

    if (!user) {
        return null;
    }

    const [timeoutId, setTimeoutId] = React.useState<NodeJS.Timeout | null>(
        null
    );
    const [coordsTimeoutId, setCoordsTimeoutId] =
        React.useState<NodeJS.Timeout | null>(null);

    const onHover = (activityId: string) => {
        if (coordsTimeoutId) {
            clearTimeout(coordsTimeoutId);
        }

        setCoordsTimeoutId(setTimeout(() => getCoords(activityId, map), 500));
    };

    const onClick = (lat: number, long: number) => {
        map?.flyTo({ center: [long, lat], zoom: 12 });
    };

    React.useEffect(() => {
        if (map) {
            setActivitiesState((state) => ({
                ...state,
                loading: true,
            }));
            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            const newTimeoutId = setTimeout(() => {
                getNewData(
                    map,
                    search,
                    limitToBbox,
                    dispatch,
                    setActivitiesState
                );
            }, 500);

            setTimeoutId(newTimeoutId);

            return () => {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
            };
        }
    }, [search, map, limitToBbox]);

    return (
        <>
            {loading && (
                <LinearProgress
                    sx={{ position: "absolute", top: 0, left: 0, right: 0 }}
                    color="primary"
                />
            )}
            <Virtuoso
                className="activities-list"
                data={activityStarts.sort((a, b) => {
                    if (!a || !b) {
                        return 0;
                    }
                    return a.startTime > b.startTime ? -1 : 1;
                })}
                itemContent={(_, activity) => (
                    <ActivityRow
                        activity={activity}
                        key={activity.id}
                        units={user.units}
                        onMouseOut={() => {
                            clearTimeout(coordsTimeoutId!);
                            clearCoords(map);
                        }}
                        onMouseOver={onHover}
                        onClick={onClick}
                    />
                )}
            />
        </>
    );
};

export default ActivitiesList;
