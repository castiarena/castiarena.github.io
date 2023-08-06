import { event } from 'react-ga'
import { Avatar, Button, Heading, HStack, VStack } from '@chakra-ui/react'
import { ChatIcon, DownloadIcon, EmailIcon, StarIcon } from '@chakra-ui/icons'
import { Layout } from '../../Layout'
import face from '../../assets/face.jpg'
import cv from '../../assets/curriculum-vitae.pdf'

export const Cv = () => {
  const handleOnClickDownload = () => {
    event({
      category: 'download',
      action: 'CV-Downloaded',
    })
  }

  const handleOnClickLinkedin = () => {
    event({
      category: 'redirect',
      action: 'linkedin',
    })
  }

  return (
    <Layout>
      <HStack flexDirection={['column', 'column', 'row']} spacing={[1, 6, 12]}>
        <VStack>
          <Avatar
            boxSize={[120, 200, 230]}
            mb={[6, 8, 0]}
            name="Agustin Castiarena"
            size="lg"
            src={face}
          />
        </VStack>

        <VStack alignItems={['center', 'center', 'flex-start']} spacing={2}>
          <Heading mb={4}>Agustin Castiarena</Heading>
          <Heading size="md">Frontend Team Lead</Heading>

          <Button
            as="a"
            href="https://linkedin.com/in/agustin-castiarena"
            leftIcon={<ChatIcon color="blue.400" />}
            onClick={handleOnClickLinkedin}
            size="sm"
            target="_blank"
            variant="link">
            linkedin.com/in/agustin-castiarena
          </Button>

          <Button
            as="a"
            href="mailto:castiarena@gmail.com"
            leftIcon={<EmailIcon color="orangered" />}
            size="sm"
            target="_blank"
            variant="link">
            castiarena@gmail.com
          </Button>
          <Button
            as="a"
            href="https://www.google.com.ar/maps/@41.3988958,2.1813664,13.24z"
            leftIcon={<StarIcon color="green" />}
            size="sm"
            target="_blank"
            variant="link">
            Barcelona - Spain
          </Button>
          <Button
            as="a"
            download="Agustin Castiarena - resume.pdf"
            href={cv}
            leftIcon={<DownloadIcon color="teal" />}
            onClick={handleOnClickDownload}
            size="sm"
            variant="link">
            Download resume
          </Button>
        </VStack>
      </HStack>
    </Layout>
  )
}
