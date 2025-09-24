import { Drawer, Stack, SxProps } from "@mui/material";
import React from "react";
import LinkButton from "./LinkButton";
import UserButton from "./UserMenu";

const DRAWER_WIDTH = 80;

const drawerStyles = (drawerWidth: number): SxProps => ({
    ".MuiDrawer-paper": {
        width: drawerWidth,
        backgroundColor: "primary.container",
        padding: "12px 8px",
        border: "none",
        boxShadow: 3,
    },
});

type Props = {
    links: {
        href: string;
        label: string;
        icon: React.ReactNode;
    }[];
};

const Sidebar = (props: Props) => {
    return (
        <Drawer
            sx={drawerStyles(DRAWER_WIDTH)}
            open
            variant="permanent"
            anchor="left"
        >
            <Stack gap="8px">
                <UserButton />
                {props.links.map((link) => (
                    <LinkButton key={link.href} {...link} />
                ))}
            </Stack>
        </Drawer>
    );
};

export default Sidebar;
