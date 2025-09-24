"use client";
import { useChallengeDashboard } from "@/state_old/ChallengeDashboardContext";
import React from "react";
import TextField from "../common/TextField";

const ChallengeSearch = () => {
    const [{ search }, setChallengeDashboardState] = useChallengeDashboard();
    return (
        <TextField
            value={search}
            onChange={(e) =>
                setChallengeDashboardState((state) => ({
                    ...state,
                    search: e.target.value,
                }))
            }
            color="primary"
            placeholder="Search challenges"
            sx={{
                marginRight: "8px",
            }}
        />
    );
};

export default ChallengeSearch;
