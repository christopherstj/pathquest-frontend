import getUser from "@/actions/getUser";
import { redirect } from "next/navigation";
import React from "react";
import { Grid2 as Grid } from "@mui/material";
import Map from "@/components/dashboard/Map";
import IncompleteChallenges from "@/components/dashboard/IncompleteChallenges";
import DashboardData from "@/state/DashboardData";
import RecentActivities from "@/components/dashboard/RecentActivities";
import PeaksSummitList from "@/components/dashboard/PeaksSummitList";

const page = async () => {
    const user = await getUser();

    if (!user.userFound || user.error) {
        redirect("/login");
    }

    return (
        <DashboardData>
            <Grid container spacing={3} minHeight="100%">
                <Map>
                    <Grid
                        size={{ xs: 12, md: 6, lg: 4 }}
                        display="flex"
                        flexDirection="column"
                        gap="16px"
                    >
                        <IncompleteChallenges />
                    </Grid>
                </Map>
                <Grid
                    size={{ xs: 12, md: 6, lg: 4 }}
                    display="flex"
                    flexDirection="column"
                    gap="16px"
                >
                    <RecentActivities />
                </Grid>
                <Grid
                    size={{ xs: 12, lg: 4 }}
                    display="flex"
                    flexDirection="column"
                    gap="16px"
                >
                    <PeaksSummitList />
                </Grid>
            </Grid>
        </DashboardData>
    );
};

export default page;
