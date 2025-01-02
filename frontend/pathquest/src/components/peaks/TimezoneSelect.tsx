import React from "react";
import SelectFormControl from "../common/SelectFormControl";
import Select from "../common/Select";
import { Autocomplete, InputLabel, MenuItem, SxProps } from "@mui/material";
import TextField, { textFieldStyles } from "../common/TextField";

type Props = {
    value: string;
    onChange: (value: string) => void;
    disabled: boolean;
};

const timezones = Intl.supportedValuesOf("timeZone");

const TimezoneSelect = ({ value, onChange, disabled }: Props) => {
    return (
        <Autocomplete
            disabled={disabled}
            disablePortal
            options={timezones}
            value={value}
            onChange={(e, value) => onChange(value as string)}
            sx={{
                flexBasis: {
                    xs: "100%",
                    md: "calc(50% - 6px)",
                },
                mt: "8px",
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Time Zone"
                    fullWidth
                    sx={textFieldStyles("primary")}
                />
            )}
        />
        // <SelectFormControl customColor="primary" sx={props.sx}>
        //     <InputLabel id="timezone-select-label">Time Zone</InputLabel>
        //     <Select
        //         labelId="timezone-select-label"
        //         label="Time Zone"
        //         customColor="primary"
        //         value={props.value}
        //         onChange={(e) => props.onChange(e.target.value as string)}
        //     >
        //         {timezones.map((tz) => (
        //             <MenuItem key={tz} value={tz}>
        //                 {tz}
        //             </MenuItem>
        //         ))}
        //     </Select>
        // </SelectFormControl>
    );
};

export default TimezoneSelect;
