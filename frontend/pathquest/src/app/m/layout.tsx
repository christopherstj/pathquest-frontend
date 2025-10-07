import React from "react";
import Map from "./Map";
import MapProvider from "@/providers/MapProvider";

type Props = {
    children: React.ReactNode;
    content: React.ReactNode;
};

const layout = (props: Props) => {
    const { children, content } = props;
    return (
        <MapProvider>
            <div className="h-screen w-full relative">
                <Map />
                {content}
            </div>
        </MapProvider>
    );
};

export default layout;
