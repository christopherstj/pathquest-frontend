"use client";
import getChallenges from "@/actions/getChallenges";
import Challenge from "@/typeDefs/Challenge";
import { Box, LinearProgress, SxProps } from "@mui/material";
import React from "react";
import TextField from "../common/TextField";
import ChallengeRow from "./ChallengeRow";

const containerStyles: SxProps = {
    display: "flex",
    flexDirection: "column",
    padding: "4px 4px 0px 4px",
    gap: "8px",
    borderRadius: "12px",
    backgroundColor: "primary.container",
    position: "relative",
    overflow: "hidden",
    width: "100%",
    maxWidth: "500px",
    height: {
        xs: "calc(70vh - 108px)",
        md: "500px",
    },
};

const resultListStyles: SxProps = {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    padding: "4px 4px 0px 4px",
    height: {
        xs: "auto",
        md: "50vh",
    },
    overflowY: "scroll",
    "&::-webkit-scrollbar": {
        display: {
            md: "none",
        },
    },
    scrollbarWidth: {
        md: "none",
    },
    "-ms-overflow-style": {
        md: "none",
    },
};

type Props = {
    initialChallenges: Challenge[];
};

const ChallengesSearch = ({ initialChallenges }: Props) => {
    const [challenges, setChallenges] =
        React.useState<Challenge[]>(initialChallenges);
    const [search, setSearch] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [timeoutId, setTimeoutId] = React.useState<NodeJS.Timeout | null>(
        null
    );

    const getData = async () => {
        const newChallenges = await getChallenges(1, 100, search);
        setChallenges(newChallenges);
    };

    React.useEffect(() => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        if (search.length > 0) {
            setLoading(true);
            const id = setTimeout(() => {
                getData();
                setLoading(false);
            }, 500);

            setTimeoutId(id);
        } else {
            setChallenges(initialChallenges);
            setLoading(false);
        }
    }, [search]);

    return (
        <Box sx={containerStyles}>
            {loading && (
                <LinearProgress
                    color="primary"
                    sx={{ position: "absolute", top: 0, left: 0, right: 0 }}
                />
            )}
            <Box width="100%" padding="12px 4px 0px 4px">
                <TextField
                    fullWidth
                    color="primary"
                    label="Search"
                    size="small"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{
                        flexBasis: "40px",
                    }}
                />
            </Box>
            <Box sx={resultListStyles}>
                {challenges.map((challenge) => (
                    <ChallengeRow challenge={challenge} key={challenge.id} />
                ))}
            </Box>
        </Box>
    );
};

export default ChallengesSearch;
