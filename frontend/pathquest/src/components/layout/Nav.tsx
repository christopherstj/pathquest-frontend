"use client";
import getRoutes from "@/helpers/getRoutes";
import { useIsMobile } from "@/helpers/useIsMobile";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import React from "react";
const Sidebar = dynamic(() => import("./Sidebar"));
const BottomNav = dynamic(() => import("./BottomNav"));

const Nav = () => {
    const { data } = useSession();
    const isMobile = useIsMobile();

    const pathname = usePathname();

    const routes = getRoutes(!!data && pathname.startsWith("/app"));

    return isMobile === null ? (
        <div />
    ) : isMobile ? (
        <BottomNav links={routes} />
    ) : (
        <Sidebar links={routes} />
    );
};

export default Nav;
