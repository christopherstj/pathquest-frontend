import { Grid2 as Grid, Typography } from "@mui/material";

export default function Home() {
    return (
        <Grid container spacing={1}>
            <Grid size={{ xs: 12 }}>
                <Typography variant="h3" color="primary">
                    This works!
                </Typography>
            </Grid>
        </Grid>
    );
}
