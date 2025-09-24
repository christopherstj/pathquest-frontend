"use client";
import { useActivities } from "@/state_old/ActivitiesContext";
import React from "react";
import TextField from "../common/TextField";

const ActivitiesSearch = () => {
    const [{ search }, setActivitiesState] = useActivities();
    return (
        <TextField
            color="primary"
            placeholder="Search activities"
            value={search}
            onChange={(e) =>
                setActivitiesState((state) => ({
                    ...state,
                    search: e.target.value,
                }))
            }
        />
    );
};

export default ActivitiesSearch;
