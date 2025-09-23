import getActivityStarts from "@/actions/activities/getActivityStarts";
import { ActivitiesState } from "@/state/ActivitiesContext";
import { GeoJSONSource } from "mapbox-gl";

const getNewData = async (
    map: mapboxgl.Map | null,
    search: string,
    limitToBbox: boolean,
    dispatch: React.Dispatch<{
        type: "SET_MESSAGE";
        payload: {
            text: string;
            type: "success" | "error";
            timeout?: number;
        };
    }>,
    setActivitiesState: React.Dispatch<React.SetStateAction<ActivitiesState>>
) => {
    if (!map) {
        setActivitiesState((prevState) => ({
            ...prevState,
            loading: false,
        }));
        return;
    }

    if ((!search || search.length === 0) && !limitToBbox) {
        dispatch({
            type: "SET_MESSAGE",
            payload: {
                text: "Please enter a search term or enable the limit to map bounds option",
                type: "error",
            },
        });

        setActivitiesState((prevState) => ({
            ...prevState,
            loading: false,
        }));
        return;
    }

    const source = map.getSource("activityStarts") as GeoJSONSource;

    if (!source) {
        setActivitiesState((prevState) => ({
            ...prevState,
            loading: false,
        }));
        return;
    }

    const bounds = map.getBounds();

    const newData = await getActivityStarts(
        limitToBbox && bounds
            ? {
                  northwest: [
                      bounds.getNorthWest().lng,
                      bounds.getNorthWest().lat,
                  ],
                  southeast: [
                      bounds.getSouthEast().lng,
                      bounds.getSouthEast().lat,
                  ],
              }
            : undefined,
        search
    );

    source.setData({
        type: "FeatureCollection",
        features: newData.map((activity) => ({
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [activity.startLong, activity.startLat],
            },
            properties: {
                ...activity,
            },
        })),
    });

    setActivitiesState((prevState) => ({
        ...prevState,
        activityStarts: newData,
        loading: false,
    }));
};

export default getNewData;
