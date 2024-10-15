import { Box, SxProps } from "@mui/material";
import React from "react";
import LinkButton from "./LinkButton";
import UserButton from "./UserButton";

const bottomNavStyles: SxProps = {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "primary.container",
    boxShadow: 3,
    padding: "0px 4px",
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
