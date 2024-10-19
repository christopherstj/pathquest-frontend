import getUser from "@/actions/getUser";
import { redirect } from "next/navigation";
import React from "react";
import { Grid2 as Grid, Typography } from "@mui/material";
import createUser from "@/actions/createUser";
import getPeakSummits from "@/actions/getPeakSummits";
import Map from "@/components/dashboard/Map";
import PeaksSummitList from "@/components/dashboard/PeaksSummitList";
import UnclimbedPeaksList from "@/components/dashboard/UnclimbedPeaksList";
import FavoritePeaks from "@/components/dashboard/FavoritePeaks";
import IncompleteChallenges from "@/components/dashboard/IncompleteChallenges";

const page = async () => {
    const user = await getUser();

    if (!user.userFound && !user.error) {
        await createUser();
    } else if (user.error) {
        redirect("/login");
    }

    return (
        <Grid container spacing={3} minHeight="100%">
            <Map />
            <Grid
                size={{ xs: 12, md: 6, lg: 4 }}
                display="flex"
                flexDirection="column"
                gap="16px"
            >
                <UnclimbedPeaksList />
            </Grid>
            <Grid
                size={{ xs: 12, md: 6, lg: 4 }}
                display="flex"
                flexDirection="column"
                gap="16px"
            >
                <FavoritePeaks />
            </Grid>
            <Grid
                size={{ xs: 12, lg: 4 }}
                display="flex"
                flexDirection="column"
                gap="16px"
            >
                <IncompleteChallenges />
            </Grid>
        </Grid>
    );
};

export default page;
