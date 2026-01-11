"use client";

import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Camera,
    X,
    Loader2,
    Trash2,
    Edit3,
    Check,
    Plus,
    ImageIcon,
    AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import getSummitPhotos from "@/actions/photos/getSummitPhotos";
import getPhotoUploadUrl from "@/actions/photos/getPhotoUploadUrl";
import completePhotoUpload from "@/actions/photos/completePhotoUpload";
import updatePhotoCaption from "@/actions/photos/updatePhotoCaption";
import deletePhoto from "@/actions/photos/deletePhoto";
import type { SummitType, SummitPhoto } from "@pathquest/shared/types";

type SummitPhotosSectionProps = {
    summitId: string;
    summitType: SummitType;
    disabled?: boolean;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_CONVERTED_SIZE = 10 * 1024 * 1024; // 10MB after conversion
// Accept all common image types - we'll convert to JPEG
const ACCEPTED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
];
// Also accept these via file extension (for browsers that don't report HEIC mime type)
const ACCEPTED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"];
const JPEG_QUALITY = 0.9; // Quality for JPEG conversion

const SummitPhotosSection = ({
    summitId,
    summitType,
    disabled = false,
}: SummitPhotosSectionProps) => {
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [uploadStatus, setUploadStatus] = useState<string>("Uploading photo...");
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
    const [editCaption, setEditCaption] = useState("");
    const [deletePhotoId, setDeletePhotoId] = useState<string | null>(null);
    const [lightboxPhoto, setLightboxPhoto] = useState<SummitPhoto | null>(null);

    // Fetch photos for this summit
    const { data: photosResult, isLoading } = useQuery({
        queryKey: ["summitPhotos", summitType, summitId],
        queryFn: () => getSummitPhotos({ summitType, summitId }),
        enabled: !!summitId,
    });

    const photos = photosResult?.data?.photos ?? [];

    // Upload mutation
    const uploadMutation = useMutation({
        mutationFn: async (file: File) => {
            setUploadProgress(0);
            setUploadStatus("Preparing photo...");
            setUploadError(null);

            // 1. Convert to JPEG if needed
            let jpegBlob: Blob;
            let dimensions: { width: number; height: number };
            
            if (file.type === "image/jpeg") {
                // Already JPEG, just use as-is
                jpegBlob = file;
                dimensions = await getImageDimensions(file);
            } else {
                // Convert to JPEG using canvas
                setUploadStatus("Converting to JPEG...");
                setUploadProgress(5);
                const converted = await convertToJpeg(file);
                jpegBlob = converted.blob;
                dimensions = { width: converted.width, height: converted.height };
            }

            // Check converted size
            if (jpegBlob.size > MAX_CONVERTED_SIZE) {
                throw new Error(`Photo is too large (${Math.round(jpegBlob.size / 1024 / 1024)}MB). Please use a smaller photo.`);
            }

            setUploadProgress(15);
            setUploadStatus("Getting upload URL...");

            // 2. Get signed upload URL
            const urlResult = await getPhotoUploadUrl({
                summitType,
                summitId,
                filename: file.name.replace(/\.[^.]+$/, ".jpg"), // Change extension to .jpg
            });

            if (!urlResult.success || !urlResult.data) {
                throw new Error(urlResult.error ?? "Failed to get upload URL");
            }

            const { uploadUrl, photoId } = urlResult.data;

            // 3. Upload file directly to GCS
            setUploadProgress(25);
            setUploadStatus("Uploading photo...");
            
            let uploadRes: Response;
            try {
                uploadRes = await fetch(uploadUrl, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "image/jpeg",
                    },
                    body: jpegBlob,
                });
            } catch (fetchError: any) {
                // Network-level error (e.g., "load failed" on Safari)
                console.error("[SummitPhotosSection] Fetch error:", fetchError);
                const errorMsg = fetchError?.message || String(fetchError);
                
                // Provide more helpful error messages for common issues
                if (errorMsg.toLowerCase().includes("load failed") || errorMsg.toLowerCase().includes("failed to fetch")) {
                    throw new Error(
                        "Upload failed - please check your internet connection and try again. " +
                        "If the problem persists, try a smaller photo or different network."
                    );
                }
                throw new Error(`Upload failed: ${errorMsg}`);
            }

            if (!uploadRes.ok) {
                const errorText = await uploadRes.text().catch(() => "");
                console.error("[SummitPhotosSection] GCS upload failed:", uploadRes.status, errorText);
                
                if (uploadRes.status === 403) {
                    throw new Error("Upload permission denied. Please try again or contact support.");
                } else if (uploadRes.status === 413) {
                    throw new Error("Photo is too large. Please use a smaller photo.");
                }
                throw new Error("Failed to upload photo to storage");
            }

            setUploadProgress(75);
            setUploadStatus("Processing...");

            // 4. Complete the upload (server generates thumbnail)
            setUploadProgress(85);
            const completeResult = await completePhotoUpload({
                photoId,
                width: dimensions.width,
                height: dimensions.height,
            });

            if (!completeResult.success) {
                throw new Error(completeResult.error ?? "Failed to complete upload");
            }

            setUploadProgress(100);
            setUploadStatus("Done!");
            return completeResult;
        },
        onSuccess: () => {
            setUploadProgress(null);
            setUploadStatus("Uploading photo...");
            queryClient.invalidateQueries({
                queryKey: ["summitPhotos", summitType, summitId],
            });
        },
        onError: (err: Error) => {
            setUploadProgress(null);
            setUploadStatus("Uploading photo...");
            setUploadError(err.message);
        },
    });

    // Caption update mutation
    const captionMutation = useMutation({
        mutationFn: async ({ photoId, caption }: { photoId: string; caption: string | null }) => {
            const result = await updatePhotoCaption({ photoId, caption });
            if (!result.success) {
                throw new Error(result.error ?? "Failed to update caption");
            }
            return result;
        },
        onSuccess: () => {
            setEditingPhotoId(null);
            queryClient.invalidateQueries({
                queryKey: ["summitPhotos", summitType, summitId],
            });
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (photoId: string) => {
            const result = await deletePhoto(photoId);
            if (!result.success) {
                throw new Error(result.error ?? "Failed to delete photo");
            }
            return result;
        },
        onSuccess: () => {
            setDeletePhotoId(null);
            queryClient.invalidateQueries({
                queryKey: ["summitPhotos", summitType, summitId],
            });
        },
    });

    const handleFileSelect = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;

            // Reset input so same file can be selected again
            e.target.value = "";

            // Validate file type - check both mime type and extension
            const extension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0] ?? "";
            const isValidType = ACCEPTED_TYPES.includes(file.type) || ACCEPTED_EXTENSIONS.includes(extension);
            
            // Some browsers (especially mobile) may report empty or generic mime type
            // for HEIC files, so also check if it looks like an image
            const looksLikeImage = file.type.startsWith("image/") || file.type === "" || file.type === "application/octet-stream";
            
            if (!isValidType && !looksLikeImage) {
                setUploadError("Please select an image file (JPEG, PNG, WebP, or HEIC)");
                return;
            }

            // Validate file size (before conversion - we'll check again after)
            if (file.size > MAX_FILE_SIZE * 2) { // Allow larger files since we'll compress
                setUploadError("File size must be under 20MB");
                return;
            }

            uploadMutation.mutate(file);
        },
        [uploadMutation]
    );

    const handleAddClick = () => {
        fileInputRef.current?.click();
    };

    const handleEditStart = (photo: SummitPhoto) => {
        setEditingPhotoId(photo.id);
        setEditCaption(photo.caption ?? "");
    };

    const handleEditSave = () => {
        if (!editingPhotoId) return;
        captionMutation.mutate({
            photoId: editingPhotoId,
            caption: editCaption.trim() || null,
        });
    };

    const handleEditCancel = () => {
        setEditingPhotoId(null);
        setEditCaption("");
    };

    const handleDeleteConfirm = () => {
        if (!deletePhotoId) return;
        deleteMutation.mutate(deletePhotoId);
    };

    const isUploading = uploadMutation.isPending;
    const isAnyMutating = isUploading || captionMutation.isPending || deleteMutation.isPending;

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Photos
                </label>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddClick}
                    disabled={disabled || isAnyMutating}
                    className="h-7 px-2 text-xs"
                >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Photo
                </Button>
            </div>

            {/* Hidden file input - accept all image types, we convert to JPEG */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif"
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* Upload progress */}
            <AnimatePresence>
                {uploadProgress !== null && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-primary/5 rounded-lg p-3 border border-primary/20"
                    >
                        <div className="flex items-center gap-2 text-sm text-primary">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>{uploadStatus}</span>
                            <span className="ml-auto font-medium">{uploadProgress}%</span>
                        </div>
                        <div className="mt-2 h-1.5 bg-primary/20 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-primary rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${uploadProgress}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Upload error */}
            <AnimatePresence>
                {uploadError && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-destructive/10 rounded-lg p-3 border border-destructive/30 flex items-center gap-2"
                    >
                        <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                        <span className="text-sm text-destructive">{uploadError}</span>
                        <button
                            type="button"
                            onClick={() => setUploadError(null)}
                            className="ml-auto text-destructive/70 hover:text-destructive"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Photos grid */}
            {isLoading ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Loading photos...
                </div>
            ) : photos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground border-2 border-dashed border-border/50 rounded-lg">
                    <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm">No photos yet</p>
                    <p className="text-xs mt-1">Add photos to remember this summit</p>
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-2">
                    {photos.map((photo) => (
                        <PhotoThumbnail
                            key={photo.id}
                            photo={photo}
                            isEditing={editingPhotoId === photo.id}
                            editCaption={editCaption}
                            onEditCaptionChange={setEditCaption}
                            onEditStart={() => handleEditStart(photo)}
                            onEditSave={handleEditSave}
                            onEditCancel={handleEditCancel}
                            onDelete={() => setDeletePhotoId(photo.id)}
                            onClick={() => setLightboxPhoto(photo)}
                            disabled={disabled || isAnyMutating}
                            isSaving={captionMutation.isPending && editingPhotoId === photo.id}
                        />
                    ))}
                </div>
            )}

            {/* Delete confirmation dialog */}
            <AlertDialog open={!!deletePhotoId} onOpenChange={(open) => !open && setDeletePhotoId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Photo?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. The photo will be permanently removed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            disabled={deleteMutation.isPending}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {deleteMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

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
    photo: SummitPhoto;
    isEditing: boolean;
    editCaption: string;
    onEditCaptionChange: (value: string) => void;
    onEditStart: () => void;
    onEditSave: () => void;
    onEditCancel: () => void;
    onDelete: () => void;
    onClick: () => void;
    disabled: boolean;
    isSaving: boolean;
};

const PhotoThumbnail = ({
    photo,
    isEditing,
    editCaption,
    onEditCaptionChange,
    onEditStart,
    onEditSave,
    onEditCancel,
    onDelete,
    onClick,
    disabled,
    isSaving,
}: PhotoThumbnailProps) => {
    return (
        <motion.div
            layout
            className="relative aspect-square rounded-lg overflow-hidden bg-muted group"
        >
            <img
                src={photo.thumbnailUrl}
                alt={photo.caption ?? "Summit photo"}
                className="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105"
                onClick={onClick}
            />

            {/* Hover overlay with actions */}
            {!isEditing && (
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEditStart();
                        }}
                        disabled={disabled}
                        className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                        title="Edit caption"
                    >
                        <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        disabled={disabled}
                        className="p-2 rounded-full bg-white/20 hover:bg-destructive/80 text-white transition-colors"
                        title="Delete photo"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Caption display */}
            {photo.caption && !isEditing && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <p className="text-white text-xs truncate">{photo.caption}</p>
                </div>
            )}

            {/* Caption edit mode */}
            {isEditing && (
                <div
                    className="absolute inset-0 bg-black/80 p-2 flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Input
                        value={editCaption}
                        onChange={(e) => onEditCaptionChange(e.target.value)}
                        placeholder="Add a caption..."
                        className="text-xs h-7 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                onEditSave();
                            } else if (e.key === "Escape") {
                                onEditCancel();
                            }
                        }}
                    />
                    <div className="flex gap-1 mt-2">
                        <button
                            type="button"
                            onClick={onEditCancel}
                            disabled={isSaving}
                            className="flex-1 p-1.5 rounded bg-white/10 hover:bg-white/20 text-white text-xs transition-colors"
                        >
                            <X className="w-3 h-3 mx-auto" />
                        </button>
                        <button
                            type="button"
                            onClick={onEditSave}
                            disabled={isSaving}
                            className="flex-1 p-1.5 rounded bg-primary hover:bg-primary/90 text-white text-xs transition-colors"
                        >
                            {isSaving ? (
                                <Loader2 className="w-3 h-3 mx-auto animate-spin" />
                            ) : (
                                <Check className="w-3 h-3 mx-auto" />
                            )}
                        </button>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

type PhotoLightboxProps = {
    photo: SummitPhoto;
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
            <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
                <X className="w-6 h-6" />
            </button>

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="max-w-full max-h-full"
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

/**
 * Get image dimensions from a File object.
 */
function getImageDimensions(file: File | Blob): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            resolve({ width: img.naturalWidth, height: img.naturalHeight });
            URL.revokeObjectURL(img.src);
        };
        img.onerror = () => {
            reject(new Error("Failed to load image"));
            URL.revokeObjectURL(img.src);
        };
        img.src = URL.createObjectURL(file);
    });
}

/**
 * Convert any image file to JPEG using canvas.
 * This handles HEIC, PNG, WebP, etc. and converts them to JPEG.
 */
function convertToJpeg(file: File): Promise<{ blob: Blob; width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        
        img.onload = () => {
            URL.revokeObjectURL(objectUrl);
            
            const canvas = document.createElement("canvas");
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            
            const ctx = canvas.getContext("2d");
            if (!ctx) {
                reject(new Error("Failed to get canvas context"));
                return;
            }
            
            // Fill with white background (for transparent PNGs)
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw the image
            ctx.drawImage(img, 0, 0);
            
            // Convert to JPEG blob
            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(new Error("Failed to convert image to JPEG"));
                        return;
                    }
                    resolve({
                        blob,
                        width: img.naturalWidth,
                        height: img.naturalHeight,
                    });
                },
                "image/jpeg",
                JPEG_QUALITY
            );
        };
        
        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            // If the browser can't load the image (e.g., HEIC on non-Safari),
            // provide a helpful error message
            reject(new Error(
                "Unable to load this image format. " +
                "Try converting to JPEG first, or use Safari on iPhone."
            ));
        };
        
        img.src = objectUrl;
    });
}

export default SummitPhotosSection;

