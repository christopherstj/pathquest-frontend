import React from "react";
import { AppSidebar } from "@/components/app/layout/AppSidebar";

type Props = {
    children: React.ReactNode;
    content: React.ReactNode;
};

// Note: MapProvider and MapBackground are in root layout - no need to duplicate here
const layout = (props: Props) => {
    const { children, content } = props;
    return (
        <div className="h-screen w-full relative pointer-events-none">
            <AppSidebar />
            <div className="pointer-events-auto">
                {content}
            </div>
        </div>
    );
};

export default layout;
