"use client";
import React from "react";
import { useSearchBoxCore } from "@mapbox/search-js-react";
import mapboxgl from "mapbox-gl";

type Props = {
    map: mapboxgl.Map;
};

const MapSearchBox = (props: Props) => {
    const [value, setValue] = React.useState("");
    const [timeoutId, setTimeoutId] = React.useState<NodeJS.Timeout | null>(
        null
    );

    const searchBoxCore = useSearchBoxCore({
        accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "",
    });

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
    };

    // const onSuggest = async () => {
    //     const response = await searchBoxCore.suggest(value, {

    //     });
    // }

    React.useEffect(() => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        if (value.length > 2) {
            const id = setTimeout(() => {}, 300);

            setTimeoutId(id);
        }
    });

    return <div>MapSearchBox</div>;
};

export default MapSearchBox;
