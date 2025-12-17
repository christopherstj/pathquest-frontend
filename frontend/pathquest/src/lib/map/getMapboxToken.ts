/**
 * Safely retrieves the Mapbox access token from environment variables.
 * Throws an error if the token is not available, which helps catch configuration issues early.
 */
export const getMapboxToken = (): string => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    
    if (!token) {
        throw new Error(
            "NEXT_PUBLIC_MAPBOX_TOKEN is not set. " +
            "Please ensure it is configured in your environment variables."
        );
    }
    
    return token;
};

