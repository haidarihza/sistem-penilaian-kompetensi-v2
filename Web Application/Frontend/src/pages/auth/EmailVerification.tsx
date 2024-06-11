import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyEmail } from "../../api/auth";
import { ApiContext } from "../../utils/context/api";
import { ApiError } from "../../interface/api";
import { Box,
  Container,
  Text,
  Image,
  Spinner } from "@chakra-ui/react"

const EmailVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const apiContext = useContext(ApiContext);
  const [verificationStatus, setVerificationStatus] = useState('Verifying...');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyEmailAsync = async () => {
      const queryParams = new URLSearchParams(location.search);
      const token = queryParams.get('token');
      const userID = queryParams.get('userID');

      try {
        if (token && userID) {
          await verifyEmail(apiContext.axios, token, userID);
          setIsLoading(false);
          setVerificationStatus('Email verified successfully. Redirecting to login page...');
          setTimeout(() => {
            navigate('/login');
          }, 1500);
        } else {
          setVerificationStatus('Invalid verification link.');
        }
      } catch (e) {
        if (e instanceof ApiError) {
          setVerificationStatus(e.message);
        } else {
          setVerificationStatus('An error occurred while verifying email.');
        }
      }
    };

    verifyEmailAsync();
  }, [location.search, apiContext, navigate]);

  return (
    <Box h="fit-content" minH="100vh" w="100vw" display="flex" flexDir="column" alignItems="center" bg="main_bg">
      <Image src="../assets/hiremif_logo.png" alt="HireMIF" w="400px" mx="10" mt="20" mb="20"/>
      {isLoading && (
        <Container display="flex" flexDir="column" alignItems="center" mb="10">
          <Spinner
            thickness='4px'
            speed='0.65s'
            emptyColor='gray.200'
            color='blue.500'
            size='xl'
          />
        </Container>
      )}
      <Text
        fontSize="xl"
        fontWeight="bold"
        color="main_text"
        mb="10"
      >{verificationStatus}</Text>
    </Box>
  )
}

export default EmailVerification;