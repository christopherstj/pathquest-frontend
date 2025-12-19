import { NextRequest, NextResponse } from "next/server";

/**
 * IP Geolocation API Route
 * 
 * Uses Vercel's built-in geo headers to infer location from IP address.
 * Returns lat/lng/city/region/country or null if unavailable.
 * 
 * This is used as part of the location fallback chain for initial map positioning.
 */
export async function GET(request: NextRequest) {
    const geo = request.geo;
    
    if (geo?.latitude && geo?.longitude) {
        return NextResponse.json({
            lat: parseFloat(geo.latitude),
            lng: parseFloat(geo.longitude),
            city: geo.city,
            region: geo.region,
            country: geo.country,
        });
    }
    
    // Return null to indicate IP geolocation is unavailable
    // (common in local development where Vercel geo headers aren't present)
    return NextResponse.json(null);
}

