"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import getSummitPhotos from "@/actions/photos/getSummitPhotos";
import type { SummitType, SummitPhoto } from "@pathquest/shared/types";

type SummitPhotoStripProps = {
    summitId: string;
    summitType: SummitType;
    /** Maximum number of thumbnails to show */
    maxThumbnails?: number;
};

/**
 * A horizontal strip of photo thumbnails for a summit.
 * Clicking a thumbnail opens a lightbox with navigation.
 */
const SummitPhotoStrip = ({
    summitId,
    summitType,
    maxThumbnails = 4,
}: SummitPhotoStripProps) => {
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    const { data: photosResult, isLoading } = useQuery({
        queryKey: ["summitPhotos", summitType, summitId],
        queryFn: () => getSummitPhotos({ summitType, summitId }),
        enabled: !!summitId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const photos = photosResult?.data?.photos ?? [];

    // Don't render anything if no photos or loading
    if (isLoading || photos.length === 0) {
        return null;
    }

    const displayedPhotos = photos.slice(0, maxThumbnails);
    const remainingCount = photos.length - maxThumbnails;

    const openLightbox = (index: number) => {
        setLightboxIndex(index);
    };

    const closeLightbox = () => {
        setLightboxIndex(null);
    };

    const goToPrevious = () => {
        if (lightboxIndex !== null && lightboxIndex > 0) {
            setLightboxIndex(lightboxIndex - 1);
        }
    };

    const goToNext = () => {
        if (lightboxIndex !== null && lightboxIndex < photos.length - 1) {
            setLightboxIndex(lightboxIndex + 1);
        }
    };

    return (
        <>
            {/* Photo Strip */}
            <div className="flex items-center gap-1.5 mt-2">
                <Camera className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                <div className="flex gap-1">
                    {displayedPhotos.map((photo, index) => (
                        <button
                            key={photo.id}
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                openLightbox(index);
                            }}
                            className="relative w-10 h-10 rounded overflow-hidden bg-muted hover:ring-2 hover:ring-primary/50 transition-all flex-shrink-0"
                        >
                            <img
                                src={photo.thumbnailUrl}
                                alt={photo.caption ?? "Summit photo"}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                    {remainingCount > 0 && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                openLightbox(maxThumbnails);
                            }}
                            className="w-10 h-10 rounded bg-muted/80 hover:bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                        >
                            +{remainingCount}
                        </button>
                    )}
                </div>
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {lightboxIndex !== null && (
                    <PhotoLightbox
                        photos={photos}
                        currentIndex={lightboxIndex}
                        onClose={closeLightbox}
                        onPrevious={goToPrevious}
                        onNext={goToNext}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

type PhotoLightboxProps = {
    photos: SummitPhoto[];
    currentIndex: number;
    onClose: () => void;
    onPrevious: () => void;
    onNext: () => void;
};

const PhotoLightbox = ({
    photos,
    currentIndex,
    onClose,
    onPrevious,
    onNext,
}: PhotoLightboxProps) => {
    const photo = photos[currentIndex];
    const hasPrevious = currentIndex > 0;
    const hasNext = currentIndex < photos.length - 1;

    // Handle keyboard navigation
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            } else if (e.key === "ArrowLeft" && hasPrevious) {
                onPrevious();
            } else if (e.key === "ArrowRight" && hasNext) {
                onNext();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose, onPrevious, onNext, hasPrevious, hasNext]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/95 flex items-center justify-center"
            onClick={onClose}
        >
            {/* Close button */}
            <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
            >
                <X className="w-6 h-6" />
            </button>

            {/* Counter */}
            <div className="absolute top-4 left-4 text-white/70 text-sm z-10">
                {currentIndex + 1} / {photos.length}
            </div>

            {/* Previous button */}
            {hasPrevious && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onPrevious();
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
            )}

            {/* Next button */}
            {hasNext && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onNext();
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            )}

            {/* Image */}
            <motion.div
                key={photo.id}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="max-w-full max-h-full p-4"
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={photo.fullUrl}
                    alt={photo.caption ?? "Summit photo"}
                    className="max-w-full max-h-[85vh] object-contain rounded-lg"
                />
                {photo.caption && (
                    <p className="text-white text-center mt-4 text-sm">{photo.caption}</p>
                )}
            </motion.div>
        </motion.div>
    );
};

export default SummitPhotoStrip;



