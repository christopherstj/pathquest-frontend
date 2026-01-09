"use client";

/**
 * OnboardingModal
 * 
 * Multi-step modal shown on first login to explain what happens during signup:
 * 1. Welcome slide - "Your Strava history is being analyzed"
 * 2. How it works slide - Brief explanation of summit detection
 * 3. What to expect slide - Time estimate, biggest adventures first
 */

import React, { useState, useCallback } from "react";
import { Mountain, MapPin, Clock, ChevronRight, ChevronLeft, Sparkles, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OnboardingSlide {
    id: string;
    icon: React.ElementType;
    title: string;
    description: string;
    highlight?: string;
}

const SLIDES: OnboardingSlide[] = [
    {
        id: "welcome",
        icon: Mountain,
        title: "Scanning Your Adventures",
        description: "We're analyzing your entire Strava history to find every peak you've summited. This happens automatically in the background.",
        highlight: "Your summits will appear as we find them!",
    },
    {
        id: "how-it-works",
        icon: MapPin,
        title: "How Summit Detection Works",
        description: "PathQuest analyzes your GPS tracks to detect when you've reached a summit. We check elevation, approach patterns, and time spent at each peak.",
        highlight: "Accuracy improves with more GPS data points.",
    },
    {
        id: "what-to-expect",
        icon: Clock,
        title: "What to Expect",
        description: "Your biggest adventures are processed first, so you'll start seeing summits within minutes. Full processing depends on your activity history.",
        highlight: "New activities always process instantly!",
    },
];

interface OnboardingModalProps {
    open: boolean;
    onComplete: () => void;
    totalActivities?: number;
    estimatedMinutes?: number;
}

const OnboardingModal = ({
    open,
    onComplete,
    totalActivities,
    estimatedMinutes,
}: OnboardingModalProps) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    
    const isLastSlide = currentSlide === SLIDES.length - 1;
    const slide = SLIDES[currentSlide];
    const Icon = slide.icon;

    const handleNext = useCallback(() => {
        if (isLastSlide) {
            onComplete();
            setCurrentSlide(0); // Reset for next time
        } else {
            setCurrentSlide((prev) => prev + 1);
        }
    }, [isLastSlide, onComplete]);

    const handlePrev = useCallback(() => {
        if (currentSlide > 0) {
            setCurrentSlide((prev) => prev - 1);
        }
    }, [currentSlide]);

    // Format time estimate for display
    const formatTimeEstimate = (minutes?: number): string => {
        if (!minutes) return "a few minutes to several hours";
        if (minutes < 60) return `about ${Math.ceil(minutes)} minutes`;
        const hours = Math.ceil(minutes / 60);
        if (hours < 24) return `about ${hours} hour${hours !== 1 ? "s" : ""}`;
        const days = Math.ceil(hours / 24);
        return `about ${days} day${days !== 1 ? "s" : ""}`;
    };

    // Dynamic description for the "what to expect" slide
    const getDescription = (slideId: string): string => {
        if (slideId === "what-to-expect" && totalActivities) {
            return `You have ${totalActivities.toLocaleString()} activities to process. Your biggest adventures are analyzed first, so you'll start seeing summits within minutes. Full processing takes ${formatTimeEstimate(estimatedMinutes)}.`;
        }
        return SLIDES.find(s => s.id === slideId)?.description || "";
    };

    // Slide animation variants
    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 50 : -50,
            opacity: 0,
        }),
    };

    return (
        <Dialog open={open} onOpenChange={() => {}}>
            <DialogContent 
                className="sm:max-w-md p-0 overflow-hidden border-primary/20"
                showCloseButton={false}
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                {/* Gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
                
                {/* Topo-style decorative pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="onboarding-topo" patternUnits="userSpaceOnUse" width="100" height="100">
                                <path d="M0 50 Q25 30 50 50 T100 50" fill="none" stroke="currentColor" strokeWidth="1"/>
                                <path d="M0 70 Q25 50 50 70 T100 70" fill="none" stroke="currentColor" strokeWidth="1"/>
                                <path d="M0 30 Q25 10 50 30 T100 30" fill="none" stroke="currentColor" strokeWidth="1"/>
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#onboarding-topo)" />
                    </svg>
                </div>

                <div className="relative p-6 pt-8">
                    {/* Slide indicator dots */}
                    <div className="flex justify-center gap-2 mb-6">
                        {SLIDES.map((_, index) => (
                            <div
                                key={index}
                                className={cn(
                                    "h-2 rounded-full transition-all duration-300",
                                    index === currentSlide 
                                        ? "w-6 bg-primary" 
                                        : "w-2 bg-foreground/20"
                                )}
                            />
                        ))}
                    </div>

                    <AnimatePresence mode="wait" custom={currentSlide}>
                        <motion.div
                            key={slide.id}
                            custom={currentSlide}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                        >
                            {/* Icon */}
                            <div className="flex justify-center mb-5">
                                <div className="w-18 h-18 rounded-2xl bg-primary/10 flex items-center justify-center">
                                    <Icon className="w-9 h-9 text-primary" />
                                </div>
                            </div>

                            {/* Title */}
                            <h2 className="text-xl font-display font-bold text-center mb-3 text-foreground">
                                {slide.title}
                            </h2>

                            {/* Description */}
                            <p className="text-sm text-muted-foreground text-center leading-relaxed mb-4 min-h-[4.5rem]">
                                {getDescription(slide.id)}
                            </p>

                            {/* Highlight box */}
                            {slide.highlight && (
                                <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/10 border border-secondary/20 mb-6">
                                    <Sparkles className="w-4 h-4 text-secondary flex-shrink-0" />
                                    <p className="text-xs text-secondary font-medium">
                                        {slide.highlight}
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation buttons */}
                    <div className="flex gap-3">
                        {currentSlide > 0 && (
                            <Button
                                variant="outline"
                                onClick={handlePrev}
                                className="flex-1"
                            >
                                <ChevronLeft className="w-4 h-4 mr-1" />
                                Back
                            </Button>
                        )}
                        
                        <Button
                            onClick={handleNext}
                            className={cn(
                                "flex-1",
                                currentSlide === 0 && "w-full"
                            )}
                        >
                            {isLastSlide ? (
                                <>
                                    Let&apos;s Go!
                                    <Check className="w-4 h-4 ml-1" />
                                </>
                            ) : (
                                <>
                                    Next
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default OnboardingModal;

