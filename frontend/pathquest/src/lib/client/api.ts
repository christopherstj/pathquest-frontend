export const buildUrl = (path: string, params?: URLSearchParams) => {
    const url = new URL(path, "http://localhost");
    if (params) {
        params.forEach((value, key) => url.searchParams.set(key, value));
    }
    return `${url.pathname}${url.search}`;
};

export const fetchLocalJson = async <T>(
    path: string,
    params?: URLSearchParams
) => {
    const url = buildUrl(path, params);
    const res = await fetch(url, {
        method: "GET",
        cache: "no-store",
        credentials: "include", // Include cookies for authentication
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`API error ${res.status}: ${text}`);
    }

    return (await res.json()) as T;
};

