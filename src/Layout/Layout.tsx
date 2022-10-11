import {Box, VStack} from "@chakra-ui/react";
import {FC, ReactNode} from "react";


export const Layout: FC<{ children: ReactNode}> = ({ children }) => {
    return <VStack
        height="100vh"
        alignItems="center"
        justifyContent="center"
        p={12}>
        <Box minW="container.md">
            {children}
        </Box>
    </VStack>
}
