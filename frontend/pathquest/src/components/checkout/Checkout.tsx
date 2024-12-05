"use client";
import ProductDisplay from "@/typeDefs/ProductDisplay";
import React from "react";
import getPlans from "./helpers/getPlans";
import { Box, Button, Divider, SxProps, Typography } from "@mui/material";
import handleSubscribe from "./helpers/handleSubscribe";
import centsToDollarString from "./helpers/centsToDollarString";

const containerStyles: SxProps = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
};

const cardStyles: SxProps = {
    borderRadius: "12px",
    backgroundColor: "primary.container",
    color: "primary.onContainer",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
};

const buttonStyles: SxProps = {
    borderRadius: "24px",
    backgroundColor: "transparent",
    borderColor: "primary.onContainer",
    color: "primary.onContainer",
    "&:hover": {
        backgroundColor: "primary.containerDim",
    },
};

const Checkout = () => {
    const [plans, setPlans] = React.useState<ProductDisplay[]>([]);
    const [loading, setLoading] = React.useState(false);

    const getData = async () => {
        setLoading(true);
        const plans = await getPlans();
        setPlans(plans);
        setLoading(false);
    };

    React.useEffect(() => {
        getData();
    }, []);

    return (
        <Box sx={containerStyles}>
            {loading ? (
                <Box sx={cardStyles}>
                    <Typography
                        variant="h5"
                        fontWeight="bold"
                        color="primary.onContainer"
                    >
                        Loading...
                    </Typography>
                </Box>
            ) : (
                plans.map((plan) => (
                    <Box sx={cardStyles} key={plan.id}>
                        <Typography
                            variant="h5"
                            fontWeight="bold"
                            color="primary.onContainer"
                        >
                            {plan.name}
                        </Typography>
                        <Divider
                            sx={{
                                width: "100%",
                                margin: "8px 0px",
                                backgroundColor: "primary.onContainer",
                            }}
                        />
                        <Typography
                            variant="body1"
                            color="primary.onContainerDim"
                            textAlign="center"
                            gutterBottom
                        >
                            {plan.description}
                        </Typography>
                        <Typography
                            variant="h6"
                            color="primary.onContainer"
                            textAlign="center"
                            gutterBottom
                        >
                            {centsToDollarString(plan.price ?? 0)} /{" "}
                            {plan.interval}
                        </Typography>
                        <Button
                            sx={buttonStyles}
                            variant="outlined"
                            onClick={() => handleSubscribe(plan.price_id)}
                        >
                            Subscribe
                        </Button>
                    </Box>
                ))
            )}
        </Box>
    );
};

export default Checkout;
