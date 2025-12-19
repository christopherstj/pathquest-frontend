import { NextRequest, NextResponse } from "next/server";

/**
 * IP Geolocation API Route
 * 
 * Uses Vercel's built-in geo headers to infer location from IP address.
 * Returns lat/lng/city/region/country or null if unavailable.
 * 
 * This is used as part of the location fallback chain for initial map positioning.
 * 
 * Vercel geo headers:
 * - x-vercel-ip-latitude
 * - x-vercel-ip-longitude
 * - x-vercel-ip-city
 * - x-vercel-ip-country-region
 * - x-vercel-ip-country
 */
export async function GET(request: NextRequest) {
    // Access Vercel's geo headers directly
    const latitude = request.headers.get("x-vercel-ip-latitude");
    const longitude = request.headers.get("x-vercel-ip-longitude");
    const city = request.headers.get("x-vercel-ip-city");
    const region = request.headers.get("x-vercel-ip-country-region");
    const country = request.headers.get("x-vercel-ip-country");
    
    if (latitude && longitude) {
        return NextResponse.json({
            lat: parseFloat(latitude),
            lng: parseFloat(longitude),
            city: city || undefined,
            region: region || undefined,
            country: country || undefined,
        });
    }
    
    // Return null to indicate IP geolocation is unavailable
    // (common in local development where Vercel geo headers aren't present)
    return NextResponse.json(null);
}

