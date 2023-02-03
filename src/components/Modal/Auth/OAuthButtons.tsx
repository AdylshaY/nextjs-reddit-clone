import { Button, Flex, Image, Text } from '@chakra-ui/react';
import React from 'react';
import { useSignInWithGoogle } from 'react-firebase-hooks/auth';
import { auth } from '@/firebase/clientApp';

const OAuthButtons: React.FC = () => {
  const [signInWithGoogle, user, loading, error] = useSignInWithGoogle(auth);
  return (
    <Flex direction='column' width='100%' mb={4}>
      <Button
        variant='oauth'
        mb={2}
        onClick={() => signInWithGoogle()}
        isLoading={loading}
      >
        <Image
          src='/images/googleLogo.png'
          alt='googleImage'
          height='20px'
          mr={2}
        />
        Continue with Google
      </Button>
      <Button variant='oauth'>Some Other Providers</Button>
      {error && <Text>{error.message}</Text>}
    </Flex>
  );
};
export default OAuthButtons;
