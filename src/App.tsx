import {Avatar, Button, Heading, HStack, Link, Text, VStack} from "@chakra-ui/react";
import {ChatIcon, DownloadIcon, EmailIcon, StarIcon} from "@chakra-ui/icons";
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
                <VStack spacing={2} alignItems={["center","center","flex-start"]}>
                    <Heading mb={4}>Agustin Castiarena</Heading>
                    <Heading size="md">Frontend Team Lead</Heading>

                    <Button
                        leftIcon={
                        <ChatIcon
                            color={"blue.400"}
                        />
                    }
                        variant={'link'}
                        size={'sm'}
                        as={'a'}
                        href="https://linkedin.com/in/agustin-castiarena"
                        target="_blank">
                        linkedin.com/in/agustin-castiarena
                    </Button>

                    <Button
                        variant={'link'}
                        as={'a'}
                        leftIcon={<EmailIcon color={'orangered'}/>}
                        size={'sm'}
                        href="mailto:castiarena@gmail.com"
                        target="_blank">
                        castiarena@gmail.com
                    </Button>
                    <Button
                        variant={'link'}
                        as={'a'}
                        size={'sm'}
                        leftIcon={<StarIcon color={'green'}/>}
                        href="https://www.google.com.ar/maps/@41.3988958,2.1813664,13.24z"
                        target="_blank">
                        Barcelona - Spain
                    </Button>
                    <Button
                        as={'a'}
                        variant={'link'}
                        size={'sm'}
                        leftIcon={<DownloadIcon color={'teal'}/>}
                        download={'Agustin Castiarena - resume.pdf'}
                        href={cv}>
                        Download resume
                    </Button>
                </VStack>
            </HStack>
        </Layout>
    )
}
