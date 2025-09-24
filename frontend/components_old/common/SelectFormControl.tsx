import FormControl, { FormControlProps } from "@mui/material/FormControl";
import { SxProps, Theme } from "@mui/material/styles";
import React from "react";

const formControlStyles = (
    customColor: "primary" | "secondary" | "tertiary"
): SxProps => ({
    ".MuiInputBase-root": {
        backgroundColor: `${customColor}.containerDim`,
        color: `${customColor}.onContainer`,
        borderRadius: "12px",
        "&::after": {
            borderColor: `${customColor}.onContainer`,
        },
    },
    ".MuiInputLabel-root": {
        color: `${customColor}.onContainerDim`,
        "&.Mui-focused": {
            color: `${customColor}.onContainerDim`,
        },
    },
    ".MuiSelect-select": {
        borderRadius: "12px",
    },
    ".MuiOutlinedInput-notchedOutline": {
        borderColor: `${customColor}.onContainerDim`,
    },
});

const SelectFormControl = ({
    sx,
    customColor,
    ...props
}: FormControlProps & {
    customColor: "primary" | "secondary" | "tertiary";
}) => {
    const formControlSx = formControlStyles(customColor);
    const totalStyles = {
        ...formControlSx,
        ...sx,
    };
    return <FormControl sx={totalStyles} {...props} />;
};

export default SelectFormControl;
