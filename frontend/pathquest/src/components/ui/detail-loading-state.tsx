"use client";

import React from "react";
import { motion } from "framer-motion";

interface DetailLoadingStateProps {
    variant?: "panel" | "inline";
    color?: "primary" | "secondary";
}

const DetailLoadingState = ({ 
    variant = "panel", 
    color = "primary" 
}: DetailLoadingStateProps) => {
    const borderColor = color === "primary" ? "border-primary" : "border-secondary";
    
    if (variant === "inline") {
        return (
            <div className="flex items-center justify-center py-10">
                <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${borderColor}`}></div>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            className="fixed top-20 right-3 md:right-5 bottom-6 w-[calc(100%-1.5rem)] md:w-[340px] max-w-[340px] pointer-events-auto z-40"
        >
            <div className="w-full h-full rounded-2xl bg-background/85 backdrop-blur-xl border border-border shadow-xl p-6 flex items-center justify-center">
                <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${borderColor}`}></div>
            </div>
        </motion.div>
    );
};

export default DetailLoadingState;






