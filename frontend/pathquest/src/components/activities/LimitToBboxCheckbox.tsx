"use client";
import { useActivities } from "@/state/ActivitiesContext";
import { Checkbox, FormControlLabel, Typography } from "@mui/material";
import React from "react";

const LimitToBboxCheckbox = () => {
    const [{ limitToBbox }, setActivitiesState] = useActivities();

    return (
        <FormControlLabel
            control={
                <Checkbox
                    checked={limitToBbox}
                    onChange={(e) =>
                        setActivitiesState((state) => ({
                            ...state,
                            limitToBbox: e.target.checked,
                        }))
                    }
                    sx={{
                        ".MuiSvgIcon-root": {
                            color: "primary.onContainerDim",
                        },
                    }}
                />
            }
            label={
                <Typography variant="body2" color="primary.onContainerDim">
                    Limit results to map bounds
                </Typography>
            }
        />
    );
};

export default LimitToBboxCheckbox;
