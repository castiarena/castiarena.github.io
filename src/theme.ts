import {extendTheme, ThemeConfig} from "@chakra-ui/react";

const config: ThemeConfig = {
    initialColorMode: 'light',
    useSystemColorMode: true
}

const colors = {
    brand: {
        900: '#323232',
        800: '#4d4d4d',
        700: '#d8d3c3',
        600: '#f4f1eb',
    },
}

const fonts = {
    heading: `"Apfel Grotezk", sans-serif;`,
    body: `"Apfel Grotezk", sans-serif;`,
}

export const theme = extendTheme({ config ,colors, fonts })

