"use client";
import { Box, Button, ButtonBase, SxProps } from "@mui/material";
import React from "react";
import ManualSummitModal from "./ManualSummitModal";

const cardStyles: SxProps = {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    padding: "12px",
    borderRadius: "12px",
    backgroundColor: "primary.container",
    flex: { md: 1 },
    flexBasis: { xs: "calc(50% - 8px)", md: "0" },
};

const AddManualSummitCard = () => {
    const [modalOpen, setModalOpen] = React.useState(false);
    return (
        <>
            <ButtonBase
                sx={cardStyles}
                onClick={() => setModalOpen(true)}
                color="primary"
            >
                Add Manual Summit
            </ButtonBase>
            <ManualSummitModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
            />
        </>
    );
};

export default AddManualSummitCard;
