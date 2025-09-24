import { Paper, SxProps, Typography } from "@mui/material";
import React from "react";
import Image from "next/image";
import logo from "../../public/images/logo-no-background.svg";
import StravaLoginButton from "./StravaLoginButton";

const paperStyles: SxProps = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
    backgroundColor: "background.paper",
    gap: "1rem",
    boxShadow: 5,
    borderRadius: "12px",
    maxWidth: "400px",
};

const LoginCard = () => {
    return (
        <Paper sx={paperStyles}>
            <Image src={logo} alt="PathQuest logo" width={300} />
            <Typography
                variant="h2"
                fontWeight="bold"
                component="h1"
                color="primary.onContainer"
            >
                PathQuest
            </Typography>
            <Typography
                variant="body1"
                component="h2"
                color="primary.onContainerDim"
                textAlign="center"
            >
                Adventure awaits! Log in to start your journey.
            </Typography>
            <StravaLoginButton />
            <Typography
                variant="body2"
                color="primary.onContainerDim"
                textAlign="center"
            >
                If this is your first time here, a new account will be
                automatically created for you, and we'll start processing your
                historical data!
            </Typography>
        </Paper>
    );
};

export default LoginCard;
