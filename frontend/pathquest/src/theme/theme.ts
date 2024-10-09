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
        base: "#2E8B57",
        main: "#2E8B57",
        contrastText: "#FFFFFF",
        container: "#123622",
        onContainer: "#C8EDD2",
        containerDim: "#1D5F3D",
        onContainerDim: "#88BA97",
    },
    secondary: {
        base: "#4682B4",
        main: "#4682B4",
        contrastText: "#FFFFFF",
        container: "#001D32",
        onContainer: "#CEE5FF",
        containerDim: "#0D4A73",
        onContainerDim: "#9BCBFA",
    },
    tertiary: {
        base: "#C71585",
        main: "#C71585",
        contrastText: "#FFFFFF",
        container: "#380724",
        onContainer: "#FFD8E7",
        containerDim: "#6D3350",
        onContainerDim: "#FEB0D2",
    },
    background: {
        default: "#0F1511",
    },
};

const baseTheme = createTheme({
    colorSchemes: {
        light: false,
        dark: {
            palette: createPalette(darkColors),
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
