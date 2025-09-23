import { Box, SxProps } from "@mui/material";
import React from "react";
import LinkButton from "./LinkButton";
import UserButton from "./UserMenu";

const bottomNavStyles: SxProps = {
    position: "fixed",
    bottom: "-1px",
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "primary.container",
    boxShadow: 3,
    padding: "0px 4px",
    zIndex: 1,
};

type Props = {
    links: {
        href: string;
        label: string;
        icon: React.ReactNode;
    }[];
};

const BottomNav = ({ links }: Props) => {
    return (
        <>
            <Box sx={bottomNavStyles}>
                {links.map((link) => (
                    <LinkButton key={link.href} {...link} />
                ))}
            </Box>
            <UserButton />
        </>
    );
};

export default BottomNav;
