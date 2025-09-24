import Dialog, { DialogProps } from "@mui/material/Dialog";
import Popper, { PopperProps } from "@mui/material/Popper";
import { SxProps } from "@mui/material/styles";
import { DateTimePickerSlotProps } from "@mui/x-date-pickers";
import { DateCalendarSlotProps } from "@mui/x-date-pickers/DateCalendar";
import { Dayjs } from "dayjs";

export const datePickerStyles = (
    color: "primary" | "secondary"
): DateTimePickerSlotProps<Dayjs, boolean> => ({
    nextIconButton: {
        sx: {
            color: `${color}.onContainerDim`,
        },
    },
    previousIconButton: {
        sx: {
            color: `${color}.onContainerDim`,
        },
    },
    calendarHeader: {
        sx: {
            color: `${color}.onContainer`,
        },
    },
    openPickerButton: {
        color,
        sx: {
            color: `${color}.onContainer`,
        },
    },
    digitalClockSectionItem: {
        sx: {
            color: `${color}.onContainerDim`,
        },
    },
    day: {
        sx: {
            color: `${color}.onContainer`,
            "&.Mui-selected": {
                backgroundColor: `${color}.onContainerDim`,
                color: `${color}.containerDim`,
            },
            "&.Mui-disabled": {
                color: `${color}.containerDim`,
            },
        },
    },
    yearButton: {
        sx: {
            color: `${color}.onContainer`,
        },
    },
});

const popperAndDialogStyles = (color: "primary" | "secondary"): SxProps => ({
    ".MuiPaper-root": {
        borderRadius: "16px",
        backgroundColor: `${color}.container`,
    },
    ".MuiDialogContent-root": {
        overflowX: "hidden",
    },
});

export const DatePickerPopper = ({ sx, ...props }: PopperProps) => {
    const totalStyles = {
        ...popperAndDialogStyles,
        ...sx,
    };
    return <Popper {...props} sx={totalStyles} />;
};

export const DatePickerDialog = ({ sx, ...props }: DialogProps) => {
    const totalStyles = {
        ...popperAndDialogStyles,
        ...sx,
    };
    return <Dialog {...props} sx={totalStyles} />;
};
