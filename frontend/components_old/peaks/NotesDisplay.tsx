import { Box, Button, Divider, IconButton, Typography } from "@mui/material";
import React from "react";
import TextField from "../common/TextField";
import { Edit } from "@mui/icons-material";

type Props = {
    value: string;
    onChange: (value: string) => void;
};

const NotesDisplay = ({ value, onChange }: Props) => {
    const [editNotes, setEditNotes] = React.useState(false);
    return (
        <>
            {editNotes ? (
                <>
                    <TextField
                        label="Notes"
                        value={value}
                        color="primary"
                        onChange={(e) => onChange(e.target.value)}
                        multiline
                        rows={2}
                        sx={{ borderRadius: "12px", mt: "8px" }}
                    />
                    <Button
                        color="primary"
                        onClick={() => setEditNotes(false)}
                        size="small"
                        variant="text"
                    >
                        Done
                    </Button>
                </>
            ) : (
                <>
                    <Box
                        display="flex"
                        flexDirection="row"
                        gap="8px"
                        alignItems="center"
                    >
                        <Typography variant="body1" color="primary.onContainer">
                            Notes
                        </Typography>
                        <IconButton
                            onClick={() => setEditNotes(true)}
                            color="primary"
                            size="small"
                        >
                            <Edit fontSize="small" />
                        </IconButton>
                    </Box>
                    <Divider
                        sx={{
                            height: "1px",
                            backgroundColor: "primary.onContainerDim",
                        }}
                    />
                    <Typography variant="body2" color="primary.onContainerDim">
                        {value ??
                            "How was this summit? What were conditions like? How was the view?"}
                        {(!value || value.length === 0) && (
                            <Button
                                color="primary"
                                size="small"
                                onClick={() => setEditNotes(true)}
                                sx={{ ml: "4px" }}
                                variant="text"
                            >
                                Make some notes!
                            </Button>
                        )}
                    </Typography>
                </>
            )}
        </>
    );
};

export default NotesDisplay;
