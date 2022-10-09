import {Box, Heading, Text, useColorMode} from "@chakra-ui/react";

export const App = () => {

    const { colorMode } = useColorMode()

    return (
        <Box bg={'brand.600'} h={'100vh'}>
            <Text>{colorMode}</Text>
            <Heading>Portfolio hello world</Heading>
            <Text>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus animi commodi consequatur, corporis debitis explicabo illo iste maiores maxime molestias nobis porro possimus qui sequi ullam ut voluptatem. Dolorum, ea!</Text>
        </Box>
    )
}
