const nodeEnv = process.env.NODE_ENV;

export const getBackendUrl = () => {
    if (nodeEnv === "production") {
        return "https://pathquest-api.app/api";
    } else {
        return "http://localhost:8080/api";
    }
};

export default getBackendUrl;
