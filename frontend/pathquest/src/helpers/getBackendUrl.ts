const nodeEnv = process.env.NODE_ENV;

export const getBackendUrl = () => {
    if (nodeEnv === "production") {
        return "https://pathquest-api.app";
    } else {
        return "http://localhost:8080";
    }
};

export default getBackendUrl;
