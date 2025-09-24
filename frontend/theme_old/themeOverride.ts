import { Palette, PaletteOptions } from "@mui/material";

declare module "@mui/material/styles" {
    interface Palette {
        tertiary: Palette["primary"];
    }

    interface PaletteOptions {
        tertiary: PaletteOptions["primary"];
    }

    interface PaletteColor {
        base: string;
        container: string;
        onContainer: string;
        containerDim: string;
        onContainerDim: string;
    }

    interface SimplePaletteColorOptions {
        base: string;
        container: string;
        onContainer: string;
        containerDim: string;
        onContainerDim: string;
    }
}
