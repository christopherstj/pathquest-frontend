"use client";
import React from "react";
import TextField from "../common/TextField";

type Props = {
    value: string;
    setValue: (value: string) => void;
};

const ChallengePeaksSearch = ({ value, setValue }: Props) => {
    return (
        <TextField
            value={value}
            onChange={(e) => setValue(e.target.value)}
            color="primary"
            placeholder="Search peaks"
            sx={{
                marginRight: "8px",
            }}
        />
    );
};

export default ChallengePeaksSearch;
