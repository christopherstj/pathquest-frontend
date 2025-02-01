import Description from "@/components/landing/Description";
import Header from "@/components/landing/Header";
import { Grid2 as Grid } from "@mui/material";

export default function Home() {
    return (
        <Grid container spacing={1} minHeight="100%">
            <Grid
                size={{ xs: 12, md: 6 }}
                display="flex"
                justifyContent="center"
                alignItems="center"
            >
                <Header />
            </Grid>
            <Grid
                size={{ xs: 12, md: 5 }}
                display="flex"
                justifyContent="center"
            >
                <Description />
            </Grid>
            {/* <BetaModal /> */}
        </Grid>
    );
}
