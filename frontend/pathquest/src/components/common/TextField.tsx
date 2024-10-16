import {
    SxProps,
    TextFieldProps,
    TextField as MuiTextField,
} from "@mui/material";
import React from "react";

const textFieldStyles = (color: "primary" | "secondary"): SxProps => ({
    borderRadius: "12px",
    backgroundColor: `${color}.containerDim`,
    color: `${color}.onContainer`,
    borderColor: `${color}.onContainer`,
    "&:hover": {
        backgroundColor: `${color}.container`,
    },
    ".MuiInputLabel-root": {
        color: `${color}.onContainer`,
    },
    ".MuiInputBase-root": {
        color: `${color}.onContainer`,
        borderColor: `${color}.onContainer`,
        borderRadius: "12px",
    },
});

const TextField = ({ sx, color, ...props }: TextFieldProps) => {
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
