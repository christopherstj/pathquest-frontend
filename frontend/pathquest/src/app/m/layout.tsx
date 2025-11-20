import React, { Suspense } from "react";
import Map from "@/components/app/map/Map";
import MapProvider from "@/providers/MapProvider";
import { AppSidebar } from "@/components/app/layout/AppSidebar";

type Props = {
    children: React.ReactNode;
    content: React.ReactNode;
};

const layout = (props: Props) => {
    const { children, content } = props;
    return (
        <MapProvider>
            <div className="h-screen w-full relative">
                <Suspense
                    fallback={<div className="h-full w-full bg-background" />}
                >
                    <Map />
                </Suspense>
                <AppSidebar />
                {content}
            </div>
        </MapProvider>
    );
};

export default layout;
