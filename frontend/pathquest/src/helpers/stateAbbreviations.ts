// Map of US state abbreviations to full names
export const STATE_ABBREVIATIONS: Record<string, string> = {
    al: "alabama",
    ak: "alaska",
    az: "arizona",
    ar: "arkansas",
    ca: "california",
    co: "colorado",
    ct: "connecticut",
    de: "delaware",
    fl: "florida",
    ga: "georgia",
    hi: "hawaii",
    id: "idaho",
    il: "illinois",
    in: "indiana",
    ia: "iowa",
    ks: "kansas",
    ky: "kentucky",
    la: "louisiana",
    me: "maine",
    md: "maryland",
    ma: "massachusetts",
    mi: "michigan",
    mn: "minnesota",
    ms: "mississippi",
    mo: "missouri",
    mt: "montana",
    ne: "nebraska",
    nv: "nevada",
    nh: "new hampshire",
    nj: "new jersey",
    nm: "new mexico",
    ny: "new york",
    nc: "north carolina",
    nd: "north dakota",
    oh: "ohio",
    ok: "oklahoma",
    or: "oregon",
    pa: "pennsylvania",
    ri: "rhode island",
    sc: "south carolina",
    sd: "south dakota",
    tn: "tennessee",
    tx: "texas",
    ut: "utah",
    vt: "vermont",
    va: "virginia",
    wa: "washington",
    wv: "west virginia",
    wi: "wisconsin",
    wy: "wyoming",
    dc: "district of columbia",
};

// Reverse map: full state names to abbreviations
export const STATE_NAMES: Record<string, string> = Object.fromEntries(
    Object.entries(STATE_ABBREVIATIONS).map(([abbr, name]) => [name, abbr])
);

/**
 * Expands a search query by adding state name/abbreviation variants.
 * For example:
 * - "nh 4000" -> ["nh 4000", "new hampshire 4000"]
 * - "new hampshire" -> ["new hampshire", "nh"]
 * - "colorado peaks" -> ["colorado peaks", "co peaks"]
 * 
 * @param query The original search query
 * @returns An array of search terms including expanded variants
 */
export const expandSearchQuery = (query: string): string[] => {
    const normalizedQuery = query.toLowerCase().trim();
    const results = [query]; // Always include original query

    // Check if query starts with a state abbreviation (e.g., "nh 4000")
    const words = normalizedQuery.split(/\s+/);
    const firstWord = words[0];
    
    if (STATE_ABBREVIATIONS[firstWord]) {
        // Expand abbreviation to full name
        const fullName = STATE_ABBREVIATIONS[firstWord];
        const restOfQuery = words.slice(1).join(" ");
        const expandedQuery = restOfQuery 
            ? `${fullName} ${restOfQuery}` 
            : fullName;
        results.push(expandedQuery);
    }

    // Check if query contains a full state name
    for (const [name, abbr] of Object.entries(STATE_NAMES)) {
        if (normalizedQuery.includes(name)) {
            // Add variant with abbreviation
            const abbreviatedQuery = normalizedQuery.replace(name, abbr);
            if (!results.includes(abbreviatedQuery)) {
                results.push(abbreviatedQuery);
            }
        }
    }

    return results;
};

/**
 * Get state full name from abbreviation, or return original if not found
 */
export const getStateName = (abbr: string): string => {
    return STATE_ABBREVIATIONS[abbr.toLowerCase()] || abbr;
};

/**
 * Get state abbreviation from full name, or return original if not found
 */
export const getStateAbbreviation = (name: string): string => {
    return STATE_NAMES[name.toLowerCase()] || name;
};

/**
 * Extracts state filter from a search query.
 * Looks for state abbreviations or full names at the end of the query.
 * Returns the state as an uppercase abbreviation (e.g., "NH", "CA") to match database format.
 * 
 * Examples:
 * - "mount washington nh" → { search: "mount washington", state: "NH" }
 * - "mount washington new hampshire" → { search: "mount washington", state: "NH" }
 * - "mount rainier" → { search: "mount rainier", state: undefined }
 * - "ca" → { search: "", state: "CA" }
 * 
 * @param query The search query
 * @returns Object with cleaned search string and optional state abbreviation filter
 */
export const extractStateFromQuery = (query: string): { search: string; state?: string } => {
    const normalizedQuery = query.trim();
    const lowerQuery = normalizedQuery.toLowerCase();
    const words = normalizedQuery.split(/\s+/);
    
    // Check if last word is a state abbreviation (e.g., "mount washington nh")
    const lastWord = words[words.length - 1]?.toLowerCase();
    if (lastWord && STATE_ABBREVIATIONS[lastWord]) {
        const searchWithoutState = words.slice(0, -1).join(' ');
        return { 
            search: searchWithoutState, 
            state: lastWord.toUpperCase() 
        };
    }
    
    // Check if query ends with a full state name (e.g., "mount washington new hampshire")
    for (const [name, abbr] of Object.entries(STATE_NAMES)) {
        if (lowerQuery.endsWith(name)) {
            const searchWithoutState = normalizedQuery.slice(0, -name.length).trim();
            return { 
                search: searchWithoutState, 
                state: abbr.toUpperCase() 
            };
        }
    }
    
    // No state found
    return { search: normalizedQuery };
};

