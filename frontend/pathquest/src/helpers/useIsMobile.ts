import { useWindowSize } from "./useWindowResize";

export const useIsMobile = () => {
    const { width: windowWidth } = useWindowSize();
    if (!windowWidth) return null;
    const isBrowserMobile = windowWidth < 900;

    return isBrowserMobile;
};
