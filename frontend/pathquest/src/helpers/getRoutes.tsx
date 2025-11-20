import {
    Home,
    LayoutDashboard,
    CircleQuestionMark,
    MountainSnow,
    ListCheck,
    Footprints,
} from "lucide-react";

const getRoutes = (authedRoutes: boolean) => {
    const publicLinks = [
        // {
        //     href: "/",
        //     label: "Home",
        //     icon: Home,
        // },
        // {
        //     href: "/app",
        //     label: "Dashboard",
        //     icon: LayoutDashboard,
        // },
        // {
        //     href: "/about",
        //     label: "About",
        //     icon: CircleQuestionMark,
        // },
        {
            href: "/m/peaks",
            label: "Peaks",
            icon: MountainSnow,
        },
        {
            href: "/m/challenges",
            label: "Challenges",
            icon: ListCheck,
        },
    ];

    const privateLinks = [
        // {
        //     href: "/app",
        //     label: "Dashboard",
        //     icon: LayoutDashboard,
        // },
        {
            href: "/app/peaks",
            label: "Peaks",
            icon: MountainSnow,
        },
        {
            href: "/app/challenges",
            label: "Challenges",
            icon: ListCheck,
        },
        {
            href: "/app/activities",
            label: "Activities",
            icon: Footprints,
        },
    ];

    return authedRoutes ? privateLinks : publicLinks;
};

export default getRoutes;
