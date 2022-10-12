import {Avatar, Button, Heading, HStack, Link, Text, VStack} from "@chakra-ui/react";
import { Layout } from "./Layout";
import face from './face.jpg'
import cv from './curriculum-vitae.pdf'

export const App = () => {
    return (
        <Layout>
            <HStack spacing={[1, 6, 12]} flexDirection={["column","column", "row"]}>
                <VStack>
                    <Avatar
                        src={face}
                        size="2xl"
                        boxSize={[120, 200, 230]}
                        name="Agustin Castiarena"
                        mb={[6, 8,0]}
                    />
                </VStack>
                <VStack spacing={1} alignItems={"flex-start"}>
                    <Heading mb={4}>Agustin Castiarena</Heading>
                    <Heading size="md">Frontend Team Lead</Heading>

                    <Button
                        variant={'link'}
                        as={'a'}
                        download={'Agustin Castiarena - resume.pdf'}
                        href={cv}>
                        Download resume
                    </Button>

                    <Button variant={'link'} as={'a'}  href="https://linkedin.com/in/agustin-castiarena" target="_blank">
                        linkedin.com/in/agustin-castiarena
                    </Button>

                    <Button
                        variant={'link'}
                        as={'a'}
                        href="mailto:castiarena@gmail.com"
                        target="_blank">
                        castiarena@gmail.com
                    </Button>
                    <Button
                        variant={'link'}
                        as={'a'}
                        leftIcon={<>📍</>}
                        href="https://www.google.com.ar/maps/@41.3988958,2.1813664,13.24z"
                        target="_blank">
                        Barcelona - Spain
                    </Button>
                </VStack>
            </HStack>
        </Layout>
    )
}
