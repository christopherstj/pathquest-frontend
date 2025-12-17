"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { getMapboxToken } from "@/lib/map/getMapboxToken";
import {
    Settings,
    MapPin,
    Mail,
    Eye,
    MessageSquare,
    Trash2,
    Loader2,
    AlertTriangle,
    Search,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useUserManagementStore } from "@/providers/UserManagementProvider";
import getUser from "@/actions/users/getUser";
import updateUser from "@/actions/users/updateUser";
import deleteUser from "@/actions/users/deleteUser";
import User from "@/typeDefs/User";

// Geocoding result type
interface GeocodingFeature {
    id: string;
    place_name: string;
    center: [number, number]; // [lng, lat]
    context?: Array<{
        id: string;
        text: string;
        short_code?: string;
    }>;
    text: string;
}

// Default map center (Boulder, CO)
const DEFAULT_CENTER: [number, number] = [-105.2705, 40.015];

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateEmail = (email: string): string | null => {
    if (!email) return null; // Empty is valid (optional field)
    if (!EMAIL_REGEX.test(email)) {
        return "Please enter a valid email address";
    }
    return null;
};

const UserManagementModal = () => {
    const { data: session, status } = useSession();
    const isOpen = useUserManagementStore((state) => state.isOpen);
    const closeModal = useUserManagementStore((state) => state.closeModal);

    // Form state
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // User data state
    const [userData, setUserData] = useState<User | null>(null);
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState<string | null>(null);
    const [locationString, setLocationString] = useState("");
    const [locationCoords, setLocationCoords] = useState<[number, number] | null>(null);
    const [updateDescription, setUpdateDescription] = useState(false);
    const [isPublic, setIsPublic] = useState(true);

    // Location search state
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<GeocodingFeature[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Map refs
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<mapboxgl.Map | null>(null);
    const markerRef = useRef<mapboxgl.Marker | null>(null);

    // Load user data when modal opens
    useEffect(() => {
        const loadUserData = async () => {
            if (!isOpen || status !== "authenticated") return;

            setIsLoading(true);
            setError(null);

            try {
                const result = await getUser();
                if (result.userFound && result.user) {
                    const user = result.user;
                    setUserData(user);
                    setEmail(user.email || "");
                    setUpdateDescription(user.update_description ?? false);
                    setIsPublic(user.is_public ?? true);

                    // Build location string from separate fields
                    const locationParts = [user.city, user.state, user.country].filter(Boolean);
                    const locationStr = locationParts.join(", ");
                    setLocationString(locationStr);
                    setSearchQuery(locationStr);

                    // Set coordinates
                    if (user.location_coords && user.location_coords[0] && user.location_coords[1]) {
                        setLocationCoords(user.location_coords);
                    } else {
                        setLocationCoords(null);
                    }
                } else {
                    setError(result.error || "Failed to load user data");
                }
            } catch (err) {
                setError("Failed to load user data");
            } finally {
                setIsLoading(false);
            }
        };

        loadUserData();
    }, [isOpen, status]);

    // Debounced search using Mapbox Geocoding API
    useEffect(() => {
        const searchLocations = async () => {
            if (searchQuery.length < 2) {
                setSearchResults([]);
                setShowDropdown(false);
                return;
            }

            setIsSearching(true);
            try {
                const token = getMapboxToken();
                const response = await fetch(
                    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?` +
                    `access_token=${token}&types=place,region,country&limit=5&language=en`
                );
                
                if (response.ok) {
                    const data = await response.json();
                    setSearchResults(data.features || []);
                    setShowDropdown(data.features?.length > 0);
                }
            } catch (err) {
                console.error("Geocoding error:", err);
            } finally {
                setIsSearching(false);
            }
        };

        const debounceTimer = setTimeout(searchLocations, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchQuery]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                searchInputRef.current &&
                !searchInputRef.current.contains(event.target as Node)
            ) {
                setShowDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Track if map is loaded and ready
    const [mapLoaded, setMapLoaded] = useState(false);

    // Update marker and map center when coordinates change
    const updateMapLocation = useCallback((coords: [number, number]) => {
        if (!mapInstance.current || !mapLoaded) {
            return;
        }

        // Update or create marker
        if (markerRef.current) {
            markerRef.current.setLngLat(coords);
        } else {
            markerRef.current = new mapboxgl.Marker({ color: "#4d7a57" })
                .setLngLat(coords)
                .addTo(mapInstance.current);
        }

        // Fly to new location
        mapInstance.current.flyTo({
            center: coords,
            zoom: 8,
        });
    }, [mapLoaded]);

    // Handle location selection from custom dropdown
    const handleSelectLocation = useCallback((feature: GeocodingFeature) => {
        const coords: [number, number] = feature.center;
        
        // Extract location parts from context
        let city = "";
        let state = "";
        let country = "";
        
        // The main text is usually the place name
        city = feature.text || "";
        
        // Context contains parent regions
        if (feature.context) {
            for (const ctx of feature.context) {
                if (ctx.id.startsWith("region")) {
                    state = ctx.text;
                } else if (ctx.id.startsWith("country")) {
                    country = ctx.text;
                }
            }
        }
        
        // Build display string
        const locationParts = [city, state, country].filter(Boolean);
        const displayString = locationParts.length > 0 
            ? locationParts.join(", ") 
            : feature.place_name;
        
        setSearchQuery(displayString);
        setLocationString(displayString);
        setLocationCoords(coords);
        setShowDropdown(false);
        setSearchResults([]);
        
        // Blur the input to prevent dropdown from reopening
        if (searchInputRef.current) {
            searchInputRef.current.blur();
        }
        
        // Update map directly
        if (mapInstance.current && mapLoaded) {
            updateMapLocation(coords);
        }
    }, [mapLoaded, updateMapLocation]);

    // Initialize map when modal opens
    useEffect(() => {
        if (!isOpen || !mapContainer.current || isLoading) return;

        // Set Mapbox token
        mapboxgl.accessToken = getMapboxToken();

        // Only create map if it doesn't exist
        if (mapInstance.current) return;

        const center = locationCoords || DEFAULT_CENTER;

        // Create new map
        const map = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/outdoors-v12",
            center: center,
            zoom: 8,
            interactive: true,
        });

        mapInstance.current = map;

        // Wait for map to load before marking as ready
        map.on('load', () => {
            setMapLoaded(true);
            
            // Add initial marker if we have coordinates
            if (locationCoords) {
                markerRef.current = new mapboxgl.Marker({ color: "#4d7a57" })
                    .setLngLat(locationCoords)
                    .addTo(map);
            }
        });

        return () => {
            setMapLoaded(false);
            if (markerRef.current) {
                markerRef.current.remove();
                markerRef.current = null;
            }
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, [isOpen, isLoading]);

    // Update map when coordinates change (separate effect)
    useEffect(() => {
        if (!mapInstance.current || !locationCoords || !mapLoaded) {
            return;
        }
        updateMapLocation(locationCoords);
    }, [locationCoords, updateMapLocation, mapLoaded]);

    // Handle email change with validation
    const handleEmailChange = (value: string) => {
        setEmail(value);
        const error = validateEmail(value);
        setEmailError(error);
    };

    // Handle save
    const handleSave = async () => {
        // Validate email before saving
        const emailValidationError = validateEmail(email);
        if (emailValidationError) {
            setEmailError(emailValidationError);
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            // Parse location string back to components
            const locationParts = locationString.split(", ").map((s) => s.trim()).filter(Boolean);
            const city = locationParts[0] || undefined;
            const state = locationParts[1] || undefined;
            const country = locationParts[2] || locationParts[locationParts.length - 1] || undefined;

            const result = await updateUser({
                email: email || undefined,
                city,
                state,
                country,
                location_coords: locationCoords,
                update_description: updateDescription,
                is_public: isPublic,
            });

            if (result.success) {
                closeModal();
            } else {
                setError(result.error || "Failed to save settings");
            }
        } catch (err) {
            setError("Failed to save settings");
        } finally {
            setIsSaving(false);
        }
    };

    // Handle delete
    const handleDelete = async () => {
        setIsDeleting(true);
        setError(null);

        try {
            const success = await deleteUser();

            if (success) {
                setShowDeleteConfirm(false);
                closeModal();
                // Sign out and redirect to home
                await signOut({ callbackUrl: "/" });
            } else {
                setError("Failed to delete account");
            }
        } catch (err) {
            setError("Failed to delete account");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            closeModal();
        }
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Settings className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-display">
                                    Account Settings
                                </DialogTitle>
                                <DialogDescription>
                                    Manage your profile and preferences
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="space-y-6 py-4">
                            {/* Location Section */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-sm font-medium">
                                    <MapPin className="w-4 h-4 text-muted-foreground" />
                                    Location
                                </label>
                                <div className="space-y-3">
                                    {/* Custom location autocomplete (bypasses buggy Mapbox SearchBox web component) */}
                                    <div className="relative">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                ref={searchInputRef}
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                                                placeholder="Search for a city or region..."
                                                className="pl-9"
                                            />
                                            {isSearching && (
                                                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                                            )}
                                        </div>
                                        
                                        {/* Search Results Dropdown */}
                                        {showDropdown && searchResults.length > 0 && (
                                            <div
                                                ref={dropdownRef}
                                                className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden"
                                            >
                                                {searchResults.map((result) => (
                                                    <button
                                                        key={result.id}
                                                        type="button"
                                                        onClick={() => handleSelectLocation(result)}
                                                        className="w-full px-3 py-2.5 text-left hover:bg-accent transition-colors flex items-start gap-2 border-b border-border last:border-b-0"
                                                    >
                                                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                                        <div className="min-w-0">
                                                            <div className="font-medium text-sm truncate">
                                                                {result.text}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground truncate">
                                                                {result.place_name}
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {/* Map Preview */}
                                    <div
                                        ref={mapContainer}
                                        className="w-full h-[200px] rounded-lg border border-border overflow-hidden"
                                    />
                                    {locationCoords && (
                                        <p className="text-xs text-muted-foreground">
                                            Coordinates: {locationCoords[1].toFixed(4)}°N, {Math.abs(locationCoords[0]).toFixed(4)}°{locationCoords[0] < 0 ? 'W' : 'E'}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Email Section */}
                            <div className="space-y-2">
                                <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                                    <Mail className="w-4 h-4 text-muted-foreground" />
                                    Email
                                </label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => handleEmailChange(e.target.value)}
                                    placeholder="your@email.com"
                                    className={emailError ? "border-red-500 focus-visible:ring-red-500" : ""}
                                />
                                {emailError && (
                                    <p className="text-xs text-red-500">{emailError}</p>
                                )}
                            </div>

                            {/* Toggle Settings */}
                            <div className="space-y-4">
                                {/* Update Strava Descriptions */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-start gap-3">
                                        <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5" />
                                        <div className="space-y-0.5">
                                            <label
                                                htmlFor="update-description"
                                                className="text-sm font-medium cursor-pointer"
                                            >
                                                Update Strava Descriptions
                                            </label>
                                            <p className="text-xs text-muted-foreground">
                                                Automatically add summit info to your activity descriptions
                                            </p>
                                        </div>
                                    </div>
                                    <Switch
                                        id="update-description"
                                        checked={updateDescription}
                                        onCheckedChange={setUpdateDescription}
                                    />
                                </div>

                                {/* Public Profile */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-start gap-3">
                                        <Eye className="w-4 h-4 text-muted-foreground mt-0.5" />
                                        <div className="space-y-0.5">
                                            <label
                                                htmlFor="is-public"
                                                className="text-sm font-medium cursor-pointer"
                                            >
                                                Public Profile
                                            </label>
                                            <p className="text-xs text-muted-foreground">
                                                Allow others to view your profile and summit history
                                            </p>
                                        </div>
                                    </div>
                                    <Switch
                                        id="is-public"
                                        checked={isPublic}
                                        onCheckedChange={setIsPublic}
                                    />
                                </div>
                            </div>

                            {/* Delete Account */}
                            <div className="pt-4 border-t border-border">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="text-red-500 border-red-500/30 hover:bg-red-500/10 hover:text-red-500"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Account
                                </Button>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="flex items-center gap-2 text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-md">
                                    <AlertTriangle className="w-4 h-4" />
                                    {error}
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={closeModal} disabled={isSaving}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isLoading || isSaving}>
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-500">
                            <AlertTriangle className="w-5 h-5" />
                            Delete Account
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your
                            account and remove all your data including summit history,
                            favorites, and profile information.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-500 hover:bg-red-600 text-white"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete Account"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default UserManagementModal;

