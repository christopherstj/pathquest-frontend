import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
    title: "PathQuest | Dashboard",
    description:
        "PathQuest is a modern adventure catalog and challenge tracker.",
};

type Props = {
    children: React.ReactNode;
};

const layout = ({ children }: Props) => {
    return <>{children}</>;
};

export default layout;
