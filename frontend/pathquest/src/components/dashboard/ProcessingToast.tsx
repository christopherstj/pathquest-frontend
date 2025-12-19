"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { RefreshCw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ProcessingToastProps {
    count: number;
    className?: string;
}

const ProcessingToast = ({ count, className }: ProcessingToastProps) => {
    const [isDismissed, setIsDismissed] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Only render portal after mount (client-side only)
    useEffect(() => {
        setMounted(true);
    }, []);

    // Reset dismissed state when count changes from 0 to > 0
    useEffect(() => {
        if (count > 0) {
            setIsDismissed(false);
        }
    }, [count]);

    if (!mounted || count === 0 || isDismissed) {
        return null;
    }

    const toast = (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={cn(
                    "fixed bottom-20 right-4 z-[100]",
                    "flex items-center gap-2.5 px-3 py-2",
                    "bg-card/95 backdrop-blur-sm border border-border/80 rounded-lg shadow-lg",
                    "text-sm",
                    className
                )}
            >
                <RefreshCw 
                    className="w-3.5 h-3.5 text-primary animate-spin flex-shrink-0" 
                    style={{ animationDuration: '2s' }} 
                />
                <span className="text-muted-foreground">
                    Processing {count} {count === 1 ? 'activity' : 'activities'}...
                </span>
                <button
                    onClick={() => setIsDismissed(true)}
                    className="p-0.5 rounded hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
                    aria-label="Dismiss"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            </motion.div>
        </AnimatePresence>
    );

    // Use portal to render at document body level, escaping any container transforms
    return createPortal(toast, document.body);
};

export default ProcessingToast;

