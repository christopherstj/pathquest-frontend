"use client";
import React from "react";
import getSession from "./helpers/getSession";
import Stripe from "stripe";
import { useRouter } from "next/navigation";
import { Box, LinearProgress, SxProps, Typography } from "@mui/material";
import processHistoricalData from "@/actions/users/processHistoricalData";

const cardStyles: SxProps = {
    borderRadius: "12px",
    backgroundColor: "primary.container",
    color: "primary.onContainer",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    position: "relative",
    overflow: "hidden",
};

type Props = {
    sessionId?: string;
};

const Success = ({ sessionId }: Props) => {
    const [status, setStatus] = React.useState<
        "loading" | "failed" | Stripe.Checkout.Session.PaymentStatus
    >("loading");
    const [customerEmail, setCustomerEmail] = React.useState<string | null>(
        null
    );

    const router = useRouter();

    const retrieveSession = async () => {
        if (!sessionId) {
            setStatus("failed");
            return;
        }

        const session = await getSession(sessionId);

        if (!session) {
            setStatus("failed");
            return;
        }

        setStatus(session.payment_status);
        setCustomerEmail(session.customer_details?.email ?? null);

        if (session.payment_status === "paid") {
            setTimeout(async () => {
                processHistoricalData();
                router.push("/app");
            }, 3000);
        }
    };

    React.useEffect(() => {
        if (sessionId) {
            retrieveSession();
        }
    }, [sessionId]);

    if (status === "loading") {
        return (
            <Box sx={cardStyles}>
                <LinearProgress
                    sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                    }}
                    color="secondary"
                />
                <Typography variant="h5" color="primary.onContainer">
                    Loading...
                </Typography>
            </Box>
        );
    } else if (status === "failed") {
        return (
            <Box sx={cardStyles}>
                <Typography variant="h5" color="primary.onContainer">
                    Failed to process subscription, please try again.
                </Typography>
            </Box>
        );
    } else {
        return (
            <Box sx={cardStyles}>
                <Typography variant="h5" color="primary.onContainer">
                    Subscription Successful!
                </Typography>
                <Typography variant="body1" color="primary.onContainerDim">
                    You will receive an email at {customerEmail} with more
                    information. Redirecting you to the app...
                </Typography>
            </Box>
        );
    }
};

export default Success;
