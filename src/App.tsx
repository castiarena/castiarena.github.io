import {Avatar, Box, Heading, HStack, Link, Text, VStack} from "@chakra-ui/react";
import { Layout } from "./Layout";
import face from './face.jpg'

export const App = () => {
    return (
        <Layout>
            <HStack spacing={[1, 6, 12]} flexDirection={["column","column", "row"]}>
                <VStack>
                    <Avatar src={face} boxSize={[120, 200, 230]}/>
                </VStack>
                <VStack spacing={1} alignItems={"flex-start"}>
                    <Heading mb={4}>Agustin Castiarena</Heading>
                    <Heading size="md">Frontend Team Lead</Heading>
                    <Link href="linkedin.com/in/agustin-castiarena" target="_blank">
                        linkedin.com/in/agustin-castiarena
                    </Link>
                    <Link href="mailto:castiarena@gmail.com" target="_blank">
                        castiarena@gmail.com
                    </Link>
                    <Link href="https://www.google.com.ar/maps/@41.3988958,2.1813664,13.24z" target="_blank">
                        Barcelona - Spain
                    </Link>
                </VStack>
            </HStack>
        </Layout>
    )
}
