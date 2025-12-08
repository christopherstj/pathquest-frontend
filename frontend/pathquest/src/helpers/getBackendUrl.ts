const nodeEnv = process.env.NODE_ENV;

export const getBackendUrl = () => {
    const override =
        process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || undefined;
    if (override) return override.replace(/\/+$/, "");

    if (nodeEnv === "production") {
        return "https://pathquest-api.app/api";
    } else {
        return "http://localhost:8080/api";
    }
};

export default getBackendUrl;
