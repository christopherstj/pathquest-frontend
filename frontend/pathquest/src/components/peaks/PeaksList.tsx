"use client";
import { usePeaks } from "@/state/PeaksContext";
import { useUser } from "@/state/UserContext";
import UnclimbedPeak from "@/typeDefs/UnclimbedPeak";
import {
    Box,
    Checkbox,
    FormControlLabel,
    SxProps,
    Typography,
} from "@mui/material";
import React from "react";
import CompletedPeakRow from "./CompletedPeakRow";
import { Virtuoso } from "react-virtuoso";
import TextField from "../common/TextField";
import UnclimbedPeakRow from "../dashboard/UnclimbedPeakRow";
import { GeoJSONSource } from "mapbox-gl";
import toggleFavoritePeak from "@/actions/peaks/toggleFavoritePeak";
import { useMessage } from "@/state/MessageContext";
import getUnclimbedPeaksWithBounds from "@/actions/peaks/getUnclimbedPeaksWithBounds";
import convertUnclimbedPeaksToGEOJson from "@/helpers/convertUnclimbedPeaksToGEOJson";
import getPeakSummits from "@/actions/peaks/getPeakSummits";

const cardStyles: SxProps = {
    borderRadius: "12px",
    backgroundColor: `primary.container`,
    paddingRight: "4px",
    paddingLeft: "8px",
    paddingTop: "8px",
    boxShadow: 3,
    display: "flex",
    flexDirection: "column",
    width: "100%",
    minHeight: "70vh",
    flex: 1,
    ".peaks-list": {
        height: "100%",
        "&::-webkit-scrollbar": {
            width: "8px",
        },
        "&::-webkit-scrollbar-thumb": {
            backgroundColor: "primary.onContainer",
            borderRadius: "8px",
        },
        "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "primary.onContainerDim",
        },
        "&::-webkit-scrollbar-track": {
            backgroundColor: "transparent",
        },
    },
};

const PeaksList = () => {
    const [
        { peakSelection, showSummittedPeaks, search, limitResultsToBbox, map },
        setPeaksState,
    ] = usePeaks();
    const [{ user }] = useUser();
    const [, dispatch] = useMessage();

    const [firstLoad, setFirstLoad] = React.useState(true);
    const [timeoutId, setTimeoutId] = React.useState<NodeJS.Timeout | null>(
        null
    );

    if (!user) return null;

    const { units } = user;

    const onRowClick = (lat: number, long: number) => {
        map?.flyTo({
            center: [long, lat],
            zoom: 14,
        });
    };

    const onFavoriteClick = async (peakId: string, newValue: boolean) => {
        if (newValue) {
            const unclimbedPeaksSource = map?.getSource(
                "unclimbedPeaks"
            ) as GeoJSONSource;
            const unclimbedPeaksData = unclimbedPeaksSource.serialize()
                .data as GeoJSON.FeatureCollection<GeoJSON.Point>;
            const peak = unclimbedPeaksData?.features.find(
                (feature) => feature.properties?.Id === peakId
            ) as GeoJSON.Feature<GeoJSON.Point>;

            if (peak) {
                unclimbedPeaksData.features =
                    unclimbedPeaksData.features.filter(
                        (feature) => feature.properties?.Id !== peakId
                    );

                unclimbedPeaksSource?.setData(unclimbedPeaksData);

                const favoritePeaksSource = map?.getSource(
                    "favoritePeaks"
                ) as GeoJSONSource;

                const favoritePeaksData = favoritePeaksSource?.serialize()
                    .data as GeoJSON.FeatureCollection<GeoJSON.Point>;

                favoritePeaksData.features = [
                    peak,
                    ...favoritePeaksData.features,
                ];

                favoritePeaksSource?.setData(favoritePeaksData);

                setPeaksState((state) => ({
                    ...state,
                    peakSelection: {
                        type: "unclimbed",
                        data: (peakSelection.data as UnclimbedPeak[]).map(
                            (peak) => {
                                if (peak.Id === peakId) {
                                    return {
                                        ...peak,
                                        isFavorited: newValue,
                                    };
                                }
                                return peak;
                            }
                        ),
                    },
                }));
            }
        } else {
            const favoritePeaksSource = map?.getSource(
                "favoritePeaks"
            ) as GeoJSONSource;
            const favoritePeaksData = favoritePeaksSource.serialize()
                .data as GeoJSON.FeatureCollection<GeoJSON.Point>;
            const peak = favoritePeaksData?.features.find(
                (feature) => feature.properties?.Id === peakId
            ) as GeoJSON.Feature<GeoJSON.Point>;

            if (peak) {
                favoritePeaksData.features = favoritePeaksData.features.filter(
                    (feature) => feature.properties?.Id !== peakId
                );

                favoritePeaksSource?.setData(favoritePeaksData);

                const unclimbedPeaksSource = map?.getSource(
                    "unclimbedPeaks"
                ) as GeoJSONSource;

                const unclimbedPeaksData = unclimbedPeaksSource?.serialize()
                    .data as GeoJSON.FeatureCollection<GeoJSON.Point>;

                unclimbedPeaksData.features = [
                    peak,
                    ...unclimbedPeaksData.features,
                ];

                unclimbedPeaksSource?.setData(unclimbedPeaksData);

                setPeaksState((state) => ({
                    ...state,
                    peakSelection: {
                        type: "unclimbed",
                        data: (peakSelection.data as UnclimbedPeak[]).map(
                            (peak) => {
                                if (peak.Id === peakId) {
                                    return {
                                        ...peak,
                                        isFavorited: newValue,
                                    };
                                }
                                return peak;
                            }
                        ),
                    },
                }));
            }
        }

        const success = await toggleFavoritePeak(peakId, newValue);

        if (!success) {
            dispatch({
                type: "SET_MESSAGE",
                payload: {
                    text: "Failed to update favorite status",
                    type: "error",
                },
            });

            const source = newValue ? "favoritePeaks" : "unclimbedPeaks";
            const target = newValue ? "unclimbedPeaks" : "favoritePeaks";

            const sourceData = map?.getSource(source) as GeoJSONSource;

            const data = sourceData.serialize()
                .data as GeoJSON.FeatureCollection<GeoJSON.Point>;

            const targetData = map?.getSource(target) as GeoJSONSource;

            const targetDataFeatures = targetData.serialize()
                .data as GeoJSON.FeatureCollection<GeoJSON.Point>;

            const peak = data.features.find(
                (feature) => feature.properties?.Id === peakId
            );

            if (peak) {
                data.features = data.features.filter(
                    (feature) => feature.properties?.Id !== peakId
                );

                sourceData.setData(data);

                targetDataFeatures.features = [
                    peak,
                    ...targetDataFeatures.features,
                ];

                targetData.setData(targetDataFeatures);
            }

            setPeaksState((state) => ({
                ...state,
                peakSelection: {
                    type: "unclimbed",
                    data: (peakSelection.data as UnclimbedPeak[]).map(
                        (peak): UnclimbedPeak => {
                            if (peak.Id === peakId) {
                                return {
                                    ...peak,
                                    isFavorited: !newValue,
                                };
                            }
                            return peak;
                        }
                    ),
                },
            }));
        }
    };

    const refreshData = async () => {
        console.log("refreshing data", peakSelection.type);
        if (peakSelection.type === "completed") {
            const peakSummits = await getPeakSummits();

            setPeaksState((state) => ({
                ...state,
                peakSelection: {
                    type: "completed",
                    data: (peakSummits ?? []).filter((peak) =>
                        peak.Name.toLowerCase().includes(search.toLowerCase())
                    ),
                },
            }));
        } else {
            if (!limitResultsToBbox && search === "") {
                dispatch({
                    type: "SET_MESSAGE",
                    payload: {
                        text: "Either enter a search term or limit results to map bounds",
                        type: "error",
                    },
                });
                return;
            }
            const bounds = map?.getBounds();
            const newData = await getUnclimbedPeaksWithBounds(
                limitResultsToBbox
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
                search,
                showSummittedPeaks
            );
            setPeaksState((state) => ({
                ...state,
                peakSelection: {
                    type: "unclimbed",
                    data: newData,
                },
            }));

            (map?.getSource("unclimbedPeaks") as GeoJSONSource)?.setData(
                convertUnclimbedPeaksToGEOJson(
                    newData.filter((peak) => !peak.isFavorited)
                )
            );
            (map?.getSource("favoritePeaks") as GeoJSONSource)?.setData(
                convertUnclimbedPeaksToGEOJson(
                    newData.filter((peak) => peak.isFavorited)
                )
            );
        }
    };

    React.useEffect(() => {
        if (!firstLoad) {
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
        } else {
            setFirstLoad(false);
        }
    }, [search, limitResultsToBbox, showSummittedPeaks]);

    return (
        <Box sx={cardStyles}>
            <TextField
                value={search}
                onChange={(e) =>
                    setPeaksState((state) => ({
                        ...state,
                        search: e.target.value,
                    }))
                }
                color="primary"
                placeholder="Search peaks"
                sx={{
                    marginRight: "8px",
                }}
            />
            {peakSelection.type === "completed" ? (
                <Virtuoso
                    className="peaks-list"
                    data={peakSelection.data.sort(
                        (a, b) => b.ascents.length - a.ascents.length
                    )}
                    itemContent={(_, peak) => (
                        <CompletedPeakRow
                            key={peak.Id}
                            peak={peak}
                            units={units}
                            onClick={onRowClick}
                        />
                    )}
                />
            ) : (
                <>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={limitResultsToBbox}
                                onChange={(e) =>
                                    setPeaksState((state) => ({
                                        ...state,
                                        limitResultsToBbox: e.target.checked,
                                    }))
                                }
                                sx={{
                                    ".MuiSvgIcon-root": {
                                        color: "primary.onContainerDim",
                                    },
                                }}
                            />
                        }
                        label={
                            <Typography
                                variant="body2"
                                color="primary.onContainerDim"
                            >
                                Limit results to map bounds
                            </Typography>
                        }
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={showSummittedPeaks}
                                onChange={(e) =>
                                    setPeaksState((state) => ({
                                        ...state,
                                        showSummittedPeaks: e.target.checked,
                                    }))
                                }
                                sx={{
                                    ".MuiSvgIcon-root": {
                                        color: "primary.onContainerDim",
                                    },
                                }}
                            />
                        }
                        label={
                            <Typography
                                variant="body2"
                                color="primary.onContainerDim"
                            >
                                Show peaks you've summited
                            </Typography>
                        }
                    />
                    <Virtuoso
                        className="peaks-list"
                        data={peakSelection.data.sort(
                            (a, b) => (b.Altitude ?? 0) - (a.Altitude ?? 0)
                        )}
                        itemContent={(_, peak) => (
                            <UnclimbedPeakRow
                                key={peak.Id}
                                peak={peak}
                                rowColor="primary"
                                units={units}
                                onRowClick={onRowClick}
                                onFavoriteClick={onFavoriteClick}
                            />
                        )}
                    />
                </>
            )}
        </Box>
    );
};

export default PeaksList;
