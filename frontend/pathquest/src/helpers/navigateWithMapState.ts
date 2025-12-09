import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

// Map state params that should be preserved across navigations
const MAP_STATE_PARAMS = ["lat", "lng", "z", "pitch", "bearing", "satellite", "3d"];

/**
 * Builds a URL path with current map state params preserved.
 * Use this when constructing links or programmatic navigation.
 */
export const buildUrlWithMapState = (pathname: string): string => {
    if (typeof window === "undefined") return pathname;

    const currentParams = new URLSearchParams(window.location.search);
    const newParams = new URLSearchParams();

    // Copy over map state params
    MAP_STATE_PARAMS.forEach((param) => {
        const value = currentParams.get(param);
        if (value !== null) {
            newParams.set(param, value);
        }
    });

    const queryString = newParams.toString();
    return queryString ? `${pathname}?${queryString}` : pathname;
};

/**
 * Navigate to a path while preserving map state query params.
 * Uses router.push for hard navigation (adds to history).
 */
export const pushWithMapState = (
    router: AppRouterInstance,
    pathname: string
): void => {
    router.push(buildUrlWithMapState(pathname), { scroll: false });
};

/**
 * Navigate to a path while preserving map state query params.
 * Uses router.replace for soft navigation (doesn't add to history).
 */
export const replaceWithMapState = (
    router: AppRouterInstance,
    pathname: string
): void => {
    router.replace(buildUrlWithMapState(pathname), { scroll: false });
};

