import {
    SxProps,
    TextFieldProps,
    TextField as MuiTextField,
} from "@mui/material";
import React from "react";

export const textFieldStyles = (color: "primary" | "secondary"): SxProps => ({
    borderRadius: "12px",
    backgroundColor: `${color}.containerDim`,
    color: `${color}.onContainer`,
    borderColor: `${color}.onContainer`,
    "&:hover": {
        backgroundColor: `${color}.container`,
    },
    ".MuiInputLabel-root": {
        color: `${color}.onContainer`,
        "&.Mui-focused": {
            color: `${color}.onContainerDim`,
        },
    },
    ".MuiInputBase-root": {
        color: `${color}.onContainer`,
        borderColor: `${color}.onContainer`,
        "&.Mui-focused": {
            borderColor: `${color}.onContainerDim`,
            ".MuiOutlinedInput-notchedOutline": {
                borderColor: `${color}.onContainerDim`,
            },
        },
        borderRadius: "12px",
    },
    ".MuiInputBase-input": {
        color: `${color}.onContainer`,
        "&:-webkit-autofill": {
            WebkitBoxShadow: `none`,
        },
    },
    ".MuiOutlinedInput-notchedOutline": {
        borderColor: `${color}.onContainer`,
    },
});

const TextField = ({
    sx,
    color,
    inverted = false,
    ...props
}: TextFieldProps & { inverted?: boolean }) => {
    const totalSx = {
        ...textFieldStyles(
            !["primary", "secondary"].includes(color ?? "primary")
                ? "primary"
                : (color as "primary" | "secondary")
        ),
        ...sx,
    };
    return <MuiTextField sx={totalSx} color={color} {...props} />;
};

export default TextField;
