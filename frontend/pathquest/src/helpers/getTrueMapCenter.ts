import mapboxgl from "mapbox-gl";

/**
 * Get the true geographic center of the map, accounting for padding.
 * 
 * When map padding is applied (e.g., for bottom drawer), Mapbox's `getCenter()` 
 * returns the center of the padded viewport, not the true geographic center.
 * This function calculates what the center would be without padding.
 * 
 * The calculation:
 * 1. Get current center and padding
 * 2. Calculate the offset caused by asymmetric padding
 * 3. Project center to pixels, adjust by offset, unproject back to coordinates
 * 
 * @param map - The Mapbox map instance
 * @returns The true geographic center as { lng, lat }
 */
const getTrueMapCenter = (map: mapboxgl.Map): { lng: number; lat: number } => {
    const center = map.getCenter();
    const padding = map.getPadding();
    
    // Handle undefined padding values (default to 0)
    const paddingTop = padding.top ?? 0;
    const paddingBottom = padding.bottom ?? 0;
    const paddingLeft = padding.left ?? 0;
    const paddingRight = padding.right ?? 0;
    
    // If no padding or symmetric padding, return the regular center
    const horizontalOffset = (paddingRight - paddingLeft) / 2;
    const verticalOffset = (paddingBottom - paddingTop) / 2;
    
    if (horizontalOffset === 0 && verticalOffset === 0) {
        return { lng: center.lng, lat: center.lat };
    }
    
    // Get the container dimensions
    const container = map.getContainer();
    if (!container) {
        return { lng: center.lng, lat: center.lat };
    }
    
    // Project the current center to pixel coordinates
    const centerPixel = map.project(center);
    
    // The padding shifts the visual center. To get the true center,
    // we need to adjust in the opposite direction of the padding offset.
    // 
    // When bottom padding is applied, the map shifts up to show content above the drawer.
    // The reported center is actually shifted up (negative Y in screen coords).
    // To get the true center, we add back the offset.
    const trueCenterPixel = [
        centerPixel.x + horizontalOffset,
        centerPixel.y + verticalOffset,
    ] as mapboxgl.PointLike;
    
    // Unproject back to geographic coordinates
    const trueCenter = map.unproject(trueCenterPixel);
    
    return { lng: trueCenter.lng, lat: trueCenter.lat };
};

export default getTrueMapCenter;

