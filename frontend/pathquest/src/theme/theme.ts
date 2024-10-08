import { createTheme, responsiveFontSizes } from "@mui/material/styles";
import createPalette, {
    PaletteOptions,
} from "@mui/material/styles/createPalette";

export const lightColors: PaletteOptions = {
    primary: {
        base: "#2E8B57",
        main: "#2E8B57",
        contrastText: "#FFFFFF",
        container: "#B0F1C2",
        onContainer: "#00210F",
        containerDim: "#95D5A8",
        onContainerDim: "#0F512F",
    },
    secondary: {
        base: "#4682B4",
        main: "#4682B4",
        contrastText: "#FFFFFF",
        container: "#CEE5FF",
        onContainer: "#001D32",
        containerDim: "#9BCBFA",
        onContainerDim: "#0D4A73",
    },
    tertiary: {
        base: "#C71585",
        main: "#C71585",
        contrastText: "#FFFFFF",
        container: "#FFD8E7",
        onContainer: "#380724",
        containerDim: "#FEB0D2",
        onContainerDim: "#6D3350",
    },
    background: {
        default: "#F6FBF3",
    },
};

export const darkColors: PaletteOptions = {
    primary: {
        base: "#9DCBFC",
        main: "#9DCBFC",
        contrastText: "#FFFFFF",
        container: "#134A74",
        onContainer: "#CFE5FF",
        containerDim: "#002844",
        onContainerDim: "#6A94C0",
    },
    secondary: {
        base: "#FFB2BC",
        main: "#FFB2BC",
        contrastText: "#FFFFFF",
        container: "#72333E",
        onContainer: "#FFD9DD",
        containerDim: "#53001A",
        onContainerDim: "#FF869A",
    },
    tertiary: {
        base: "#E8C26C",
        main: "#E8C26C",
        contrastText: "#FFFFFF",
        container: "#5B4300",
        onContainer: "#FFDF9B",
        containerDim: "#3F2E00",
        onContainerDim: "#B28B26",
    },
    background: {
        default: "#101418",
    },
};

const baseTheme = createTheme({
    colorSchemes: {
        light: {
            palette: createPalette(lightColors),
        },
    },
    components: {
        MuiTypography: {
            styleOverrides: {
                root: {
                    fontFamily: "var(--font-bicyclette)",
                },
            },
        },
    },
});

export const theme = responsiveFontSizes(baseTheme);
