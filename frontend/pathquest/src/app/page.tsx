import LoginCard from "@/components/auth/LoginCard";
import { Grid2 as Grid, Typography } from "@mui/material";

export default function Home() {
    return (
        <Grid container spacing={1} minHeight="100%">
            <Grid
                size={{ xs: 12 }}
                display="flex"
                justifyContent="center"
                alignItems="center"
            >
                <LoginCard />
            </Grid>
        </Grid>
    );
}
