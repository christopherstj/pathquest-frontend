import GridContainer from "@/components/common/GridContainer";
import React from "react";
import { Grid2 as Grid } from "@mui/material";
import Success from "@/components/checkout/Success";

type Props = {
    searchParams: {
        sessionId?: string;
    };
};

const page = ({ searchParams: { sessionId } }: Props) => {
    return <Success sessionId={sessionId} />;
};

export default page;
