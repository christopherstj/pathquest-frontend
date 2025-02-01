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
        base: "#004D40",
        main: "#004D40",
        contrastText: "#FFFFFF",
        container: "#162320",
        onContainer: "#A1F2DC",
        containerDim: "#2A4843",
        onContainerDim: "#85D6C1",
    },
    secondary: {
        base: "#ADD8E6",
        main: "#ADD8E6",
        contrastText: "#FFFFFF",
        container: "#182528",
        onContainer: "#AFECFF",
        containerDim: "#25393D",
        onContainerDim: "#85D2E8",
    },
    tertiary: {
        base: "#CB6EC5",
        main: "#CB6EC5",
        contrastText: "#FFFFFF",
        container: "#380724",
        onContainer: "#FFD8E7",
        containerDim: "#6D3350",
        onContainerDim: "#FEB0D2",
    },
    background: {
        default: "#080C0B",
        paper: "#2A302EFF",
    },
};

const palette = createPalette(darkColors);

const baseTheme = createTheme({
    palette: {
        ...palette,
        mode: "dark",
    },
    // colorSchemes: {
    //     light: {
    //         palette: createPalette(lightColors),
    //     },
    //     dark: {
    //         palette: createPalette(darkColors),
    //     },
    // },
    cssVariables: {
        colorSchemeSelector: "class",
    },
    components: {
        MuiTypography: {
            styleOverrides: {
                h1: {
                    fontFamily: "var(--font-raleway)",
                },
                h2: {
                    fontFamily: "var(--font-raleway)",
                },
                h3: {
                    fontFamily: "var(--font-raleway)",
                },
                h4: {
                    fontFamily: "var(--font-raleway)",
                },
                h5: {
                    fontFamily: "var(--font-raleway)",
                },
                h6: {
                    fontFamily: "var(--font-raleway)",
                },
                body1: {
                    fontFamily: "var(--font-merriweather-sans)",
                },
                body2: {
                    fontFamily: "var(--font-merriweather-sans)",
                },
                caption: {
                    fontFamily: "var(--font-merriweather-sans)",
                },
                button: {
                    fontFamily: "var(--font-merriweather-sans)",
                },
                root: {
                    color: palette.primary.onContainer,
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: "none",
                    fontFamily: "var(--font-merriweather-sans)",
                    fontWeight: "bold",
                    borderRadius: "24px",
                },
            },
            defaultProps: {
                variant: "contained",
            },
            variants: [
                {
                    props: { color: "primary", variant: "text" },
                    style: {
                        color: palette.primary.onContainerDim,
                        "&:hover": {
                            backgroundColor: palette.primary.containerDim,
                        },
                    },
                },
                {
                    props: { color: "secondary", variant: "text" },
                    style: {
                        color: palette.secondary.onContainer,
                        "&:hover": {
                            backgroundColor: palette.secondary.containerDim,
                        },
                    },
                },
                {
                    props: { color: "primary", variant: "contained" },
                    style: {
                        backgroundColor: palette.primary.container,
                        color: palette.primary.onContainerDim,
                        "&:hover": {
                            backgroundColor: palette.primary.containerDim,
                        },
                    },
                },
                {
                    props: { color: "secondary", variant: "contained" },
                    style: {
                        backgroundColor: palette.secondary.container,
                        color: palette.secondary.onContainer,
                        "&:hover": {
                            backgroundColor: palette.secondary.containerDim,
                        },
                    },
                },
                {
                    props: {
                        variant: "outlined",
                        color: "primary",
                    },
                    style: {
                        color: palette.primary.onContainerDim,
                        borderColor: palette.primary.onContainer,
                        "&:hover": {
                            backgroundColor: palette.primary.containerDim,
                        },
                    },
                },
                {
                    props: {
                        variant: "outlined",
                        color: "secondary",
                    },
                    style: {
                        color: palette.secondary.onContainerDim,
                        borderColor: palette.secondary.onContainer,
                        "&:hover": {
                            backgroundColor: palette.secondary.containerDim,
                        },
                    },
                },
            ],
        },
        MuiButtonBase: {
            styleOverrides: {
                root: {
                    textTransform: "none",
                    fontFamily: "var(--font-merriweather-sans)",
                    fontWeight: "500",
                    transition: "background-color 0.15s",
                },
            },
            variants: [
                {
                    props: { color: "primary" },
                    style: {
                        backgroundColor: palette.primary.container,
                        color: palette.primary.onContainer,
                        "&:hover": {
                            backgroundColor: palette.primary.containerDim,
                        },
                    },
                },
            ],
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: "12px",
                    backgroundColor: palette.primary.container,
                },
            },
        },
        MuiPopover: {
            styleOverrides: {
                paper: {
                    borderRadius: "12px",
                    backgroundColor: palette.primary.container,
                },
            },
        },
        MuiDialogTitle: {
            styleOverrides: {
                root: {
                    color: palette.primary.onContainer,
                    // borderBottom: `1px solid ${palette.primary.onContainerDim}`,
                },
            },
        },
        MuiDialogContentText: {
            styleOverrides: {
                root: {
                    color: palette.primary.onContainerDim,
                },
            },
        },
        MuiFormControlLabel: {
            variants: [
                {
                    props: { color: "primary" },
                    style: {
                        color: palette.primary.onContainer,
                    },
                },
            ],
        },
        MuiCheckbox: {
            variants: [
                {
                    props: { color: "primary" },
                    style: {
                        color: palette.primary.onContainer,
                        "&.Mui-checked": {
                            color: palette.primary.onContainer,
                        },
                    },
                },
            ],
        },
        MuiAutocomplete: {
            styleOverrides: {
                paper: {
                    backgroundColor: palette.primary.container,
                    color: palette.primary.onContainer,
                    borderRadius: "12px",
                },
            },
        },
        MuiDivider: {
            styleOverrides: {
                root: {
                    height: "2px",
                },
            },
            variants: [
                {
                    props: { color: "primary" },
                    style: {
                        backgroundColor: palette.primary.onContainer,
                    },
                },
                {
                    props: { color: "secondary" },
                    style: {
                        backgroundColor: palette.secondary.onContainer,
                    },
                },
            ],
        },
        MuiIconButton: {
            variants: [
                {
                    props: { color: "primary" },
                    style: {
                        color: palette.primary.onContainer,
                    },
                },
            ],
        },
        MuiSvgIcon: {
            styleOverrides: {
                root: {
                    color: palette.primary.onContainer,
                },
            },
        },
        MuiLinearProgress: {
            variants: [
                {
                    props: { color: "primary" },
                    style: {
                        color: palette.primary.onContainer,
                    },
                },
            ],
        },
    },
});

export const theme = responsiveFontSizes(baseTheme);
