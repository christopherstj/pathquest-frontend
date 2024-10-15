import {
    Checklist,
    Dashboard,
    DirectionsRun,
    Home,
    Landscape,
    QuestionMark,
} from "@mui/icons-material";

const getRoutes = (authedRoutes: boolean) => {
    const publicLinks = [
        {
            href: "/",
            label: "Home",
            icon: <Home />,
        },
        {
            href: "/app",
            label: "Dashboard",
            icon: <Dashboard />,
        },
        {
            href: "/about",
            label: "About",
            icon: <QuestionMark />,
        },
        {
            href: "/peaks",
            label: "Peaks",
            icon: <Landscape />,
        },
        {
            href: "/challenges",
            label: "Challenges",
            icon: <Checklist />,
        },
    ];

    const privateLinks = [
        {
            href: "/app",
            label: "Dashboard",
            icon: <Dashboard />,
        },
        {
            href: "/app/peaks",
            label: "Peaks",
            icon: <Landscape />,
        },
        {
            href: "/app/challenges",
            label: "Challenges",
            icon: <Checklist />,
        },
        {
            href: "/app/activities",
            label: "Activities",
            icon: <DirectionsRun />,
        },
    ];

    return authedRoutes ? privateLinks : publicLinks;
};

export default getRoutes;
