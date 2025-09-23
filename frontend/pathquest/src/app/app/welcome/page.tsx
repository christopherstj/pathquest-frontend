import Card from "@/components/common/Card";
import GridContainer from "@/components/common/GridContainer";
import { Box, Button, Divider, SxProps, Typography } from "@mui/material";
import React from "react";
import Image from "next/image";
import logo from "../../../public/images/logo-no-background.svg";
import Link from "next/link";

const containerStyles: SxProps = {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
};

const cardStyles: SxProps = {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    alignItems: "center",
    justifyContent: "center",
    maxWidth: "450px",
};

const buttonStyles: SxProps = {
    backgroundColor: "tertiary.base",
    color: "tertiary.onContainer",
    borderRadius: "24px",
};

const page = () => {
    return (
        <Box sx={containerStyles}>
            <Card sx={cardStyles} color="background">
                <Image src={logo} alt="PathQuest logo" width={300} />
                <Typography variant="h3" textAlign="center" gutterBottom>
                    Welcome to PathQuest!
                </Typography>
                <Divider
                    sx={{
                        backgroundColor: "primary.onContainerDim",
                        width: "100%",
                    }}
                />
                <Typography variant="body1" textAlign="center">
                    We're so glad you're here! We've begun processing your
                    historical data, these may take a few hours to a few days,
                    depending on how much data you have. Feel free to go check
                    out all of the peaks in our database while you wait!
                </Typography>
                <Button
                    LinkComponent={Link}
                    href="/app/peaks"
                    variant="contained"
                    sx={buttonStyles}
                >
                    Explore Peaks
                </Button>
            </Card>
        </Box>
    );
};

export default page;
