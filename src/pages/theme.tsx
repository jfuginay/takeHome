// theme.js or theme.ts
import { extendTheme } from "@chakra-ui/react";
import { color } from "framer-motion";

const theme = extendTheme({
  config: {
    initialColorMode: "dark",
    useSystemColorMode: false,
    colors: {
        primary: {
            50: "#f3f2ff",
            100: "#d8d6ff",
            200: "#b8b5ff",
            300: "#9893ff",
            400: "#7a71ff",
            500: "#664eff",
            600: "#4d2dfb",
            700: "#3a1eb7",
            800: "#28117e",
            900: "#180852",
        },
        },
  },
});

export default theme;
