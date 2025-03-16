import getWeatherByPeak from "@/actions/getWeatherByPeak";
import dayjs from "@/helpers/dayjs";
import { Box, SxProps, Typography } from "@mui/material";
import React from "react";
import HourlyWeatherChart from "./HourlyWeatherChart";

const containerStyles: SxProps = {
    borderRadius: "12px",
    backgroundColor: "secondary.container",
    padding: "12px",
    height: "60vh",
};

type Props = {
    peakId: string;
};

const PeakWeather = async ({ peakId }: Props) => {
    const weather = await getWeatherByPeak(peakId);

    if (!weather) {
        return null;
    }

    const { hourly } = weather;

    return (
        <Box sx={containerStyles}>
            <HourlyWeatherChart data={hourly} />
        </Box>
    );
};

export default PeakWeather;
