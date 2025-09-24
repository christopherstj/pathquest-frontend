import React from "react";
import Map from "./Map";
import MapProvider from "@/providers/MapProvider";

type Props = {
    children: React.ReactNode;
};

const layout = (props: Props) => {
    const { children } = props;
    return (
        <MapProvider>
            <div className="h-screen w-full relative">
                <Map />
                {children}
            </div>
        </MapProvider>
    );
};

export default layout;
