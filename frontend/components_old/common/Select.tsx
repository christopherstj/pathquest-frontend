import React from "react";
import MuiSelect, { SelectProps } from "@mui/material/Select";
import { SxProps } from "@mui/material/styles";

const menuStyles = (
    customColor: "primary" | "secondary" | "tertiary"
): SxProps => ({
    ".MuiPaper-root": {
        backgroundColor: `${customColor}.containerDim`,
        color: `${customColor}.onContainer`,
        borderRadius: "12px",
    },
});

const Select = ({
    MenuProps,
    customColor,
    ...props
}: SelectProps & {
    customColor: "primary" | "secondary" | "tertiary";
}) => {
    const menuSx = menuStyles(customColor);
    const totalStyles = {
        ...menuSx,
        ...MenuProps?.sx,
    };
    return (
        <MuiSelect MenuProps={{ sx: totalStyles, ...MenuProps }} {...props} />
    );
};

export default Select;
