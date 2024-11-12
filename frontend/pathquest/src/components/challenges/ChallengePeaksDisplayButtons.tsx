"use client";
import { Button, ButtonGroup, SxProps } from "@mui/material";
import React from "react";

const buttonGroupStyles: SxProps = {
    borderRadius: "24px",
    borderColor: "primary.onContainer",
};

const buttonStyles = (selected: boolean): SxProps => ({
    borderRadius: "24px",
    borderColor: "primary.onContainer",
    backgroundColor: selected ? "primary.onContainer" : "transparent",
    color: selected ? "primary.container" : "primary.onContainer",
});

type Props = {
    value: "all" | "completed" | "unclimbed";
    setValue: (value: "all" | "completed" | "unclimbed") => void;
};

const ChallengePeaksDisplayButtons = ({ value, setValue }: Props) => {
    return (
        <ButtonGroup
            variant="outlined"
            fullWidth
            aria-label="Basic button group"
            sx={buttonGroupStyles}
        >
            <Button
                sx={buttonStyles(value === "all")}
                onClick={(e) => setValue("all")}
            >
                All Peaks
            </Button>
            <Button
                sx={buttonStyles(value === "unclimbed")}
                onClick={(e) => setValue("unclimbed")}
            >
                Unclimbed
            </Button>
            <Button
                sx={buttonStyles(value === "completed")}
                onClick={(e) => setValue("completed")}
            >
                Completed
            </Button>
        </ButtonGroup>
    );
};

export default ChallengePeaksDisplayButtons;
