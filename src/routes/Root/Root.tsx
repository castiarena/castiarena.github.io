import { VStack, Link } from '@chakra-ui/react'
import { useEffect } from 'react'
import { Link as LinkRoute, redirect } from 'react-router-dom'

export const Root = () => {
  useEffect(() => {
    redirect('/cv')
    console.log('redirected')
  }, [])

  return (
    <VStack>
      <Link as={LinkRoute} to="/cv">
        CV
      </Link>
      <Link as={LinkRoute} to="/writting">
        Writting
      </Link>
    </VStack>
  )
}
