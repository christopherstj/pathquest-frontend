"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, Loader2, User, ImageIcon } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import getPeakPhotos from "@/actions/photos/getPeakPhotos";
import type { PublicPeakPhoto } from "@pathquest/shared/types";

type PeakPhotosGalleryProps = {
    peakId: string;
    /** Number of photos to show in compact mode before "View all" */
    compactLimit?: number;
    /** If true, shows a "View all" button when there are more photos */
    showViewAll?: boolean;
};

const PAGE_SIZE = 20;

const PeakPhotosGallery = ({
    peakId,
    compactLimit = 6,
    showViewAll = true,
}: PeakPhotosGalleryProps) => {
    const [lightboxPhoto, setLightboxPhoto] = useState<PublicPeakPhoto | null>(null);
    const [showAll, setShowAll] = useState(false);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    // Fetch photos with cursor-based pagination
    const {
        data,
        isLoading,
        isError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ["peakPhotos", peakId],
        queryFn: async ({ pageParam }) => {
            const result = await getPeakPhotos({
                peakId,
                cursor: pageParam,
                limit: PAGE_SIZE,
            });
            if (!result.success || !result.data) {
                throw new Error(result.error ?? "Failed to fetch photos");
            }
            return result.data;
        },
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
        enabled: !!peakId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // Flatten all pages into a single array
    const allPhotos = data?.pages.flatMap((page) => page.photos) ?? [];
    const totalCount = data?.pages[0]?.totalCount ?? 0;
    
    // In compact mode, only show first compactLimit photos
    const displayedPhotos = showAll ? allPhotos : allPhotos.slice(0, compactLimit);
    const hasMoreToShow = totalCount > compactLimit;

    // Infinite scroll: observe the load more trigger
    const handleLoadMore = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage && showAll) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, showAll, fetchNextPage]);

    useEffect(() => {
        if (!showAll) return;
        
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    handleLoadMore();
                }
            },
            { threshold: 0.1 }
        );

        const current = loadMoreRef.current;
        if (current) {
            observer.observe(current);
        }

        return () => {
            if (current) {
                observer.unobserve(current);
            }
        };
    }, [handleLoadMore, showAll]);

    if (isLoading) {
        return (
            <div className="py-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-3">
                    <Camera className="w-4 h-4" />
                    <span className="text-sm font-medium">Photos</span>
                </div>
                <div className="flex items-center justify-center py-6">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
            </div>
        );
    }

    if (isError) {
        return null; // Silently fail - photos are not critical
    }

    if (allPhotos.length === 0) {
        return (
            <div className="py-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-3">
                    <Camera className="w-4 h-4" />
                    <span className="text-sm font-medium">Photos</span>
                </div>
                <div className="flex flex-col items-center justify-center py-6 text-muted-foreground border border-dashed border-border/50 rounded-lg">
                    <ImageIcon className="w-6 h-6 mb-2 opacity-50" />
                    <p className="text-xs">No community photos yet</p>
                </div>
            </div>
        );
    }

    return (
        <div className="py-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Camera className="w-4 h-4" />
                    <span className="text-sm font-medium">Photos</span>
                    <span className="text-xs text-muted-foreground/70">
                        ({totalCount})
                    </span>
                </div>
                {showViewAll && hasMoreToShow && !showAll && (
                    <button
                        onClick={() => setShowAll(true)}
                        className="text-xs text-primary hover:text-primary/80 transition-colors"
                    >
                        View all
                    </button>
                )}
            </div>

            {/* Photo Grid */}
            <div className="grid grid-cols-3 gap-1.5">
                {displayedPhotos.map((photo) => (
                    <PhotoThumbnail
                        key={photo.id}
                        photo={photo}
                        onClick={() => setLightboxPhoto(photo)}
                    />
                ))}
            </div>

            {/* Load more trigger (invisible sentinel) */}
            {showAll && hasNextPage && (
                <div ref={loadMoreRef} className="py-4 flex justify-center">
                    {isFetchingNextPage && (
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    )}
                </div>
            )}

            {/* Show less button */}
            {showViewAll && hasMoreToShow && showAll && (
                <button
                    onClick={() => setShowAll(false)}
                    className="w-full mt-2 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                    Show less
                </button>
            )}

            {/* Lightbox */}
            <AnimatePresence>
                {lightboxPhoto && (
                    <PhotoLightbox
                        photo={lightboxPhoto}
                        onClose={() => setLightboxPhoto(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

type PhotoThumbnailProps = {
    photo: PublicPeakPhoto;
    onClick: () => void;
};

const PhotoThumbnail = ({ photo, onClick }: PhotoThumbnailProps) => {
    return (
        <motion.button
            type="button"
            onClick={onClick}
            className="relative aspect-square rounded-md overflow-hidden bg-muted group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <img
                src={photo.thumbnailUrl}
                alt={photo.caption ?? "Summit photo"}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                loading="lazy"
            />
            {/* Hover overlay with user info */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                {photo.userName && (
                    <div className="absolute bottom-1 left-1 right-1 flex items-center gap-1 text-white">
                        <User className="w-2.5 h-2.5" />
                        <span className="text-[10px] truncate">{photo.userName}</span>
                    </div>
                )}
            </div>
        </motion.button>
    );
};

type PhotoLightboxProps = {
    photo: PublicPeakPhoto;
    onClose: () => void;
};

const PhotoLightbox = ({ photo, onClose }: PhotoLightboxProps) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={onClose}
        >
            {/* Close button */}
            <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
                aria-label="Close lightbox"
            >
                <X className="w-6 h-6" />
            </button>

            {/* Photo */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="max-w-full max-h-full flex flex-col items-center"
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={photo.fullUrl}
                    alt={photo.caption ?? "Summit photo"}
                    className="max-w-full max-h-[80vh] object-contain rounded-lg"
                />
                
                {/* Photo info */}
                <div className="mt-4 text-center">
                    {photo.caption && (
                        <p className="text-white text-sm mb-2">{photo.caption}</p>
                    )}
                    {photo.userName && (
                        <div className="flex items-center justify-center gap-1.5 text-white/70 text-xs">
                            <User className="w-3 h-3" />
                            <span>{photo.userName}</span>
                        </div>
                    )}
                    {photo.takenAt && (
                        <p className="text-white/50 text-xs mt-1">
                            {new Date(photo.takenAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                            })}
                        </p>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default PeakPhotosGallery;

