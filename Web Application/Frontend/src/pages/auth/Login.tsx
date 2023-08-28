import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../utils/context/auth";
import { login } from "../../api/auth";
import { ApiContext } from "../../utils/context/api";
import { ApiError } from "../../interface/api";
import { Box, Container, FormControl, FormLabel, FormErrorMessage, Text, Input, InputGroup, Button, InputRightElement } from "@chakra-ui/react"

const Login = () => {
  const authContext = useContext(AuthContext);
  const apiContext = useContext(ApiContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (authContext.isAuthenticated) {
      navigate("/")
    }
  }, []);

  const [email, setEmail] = useState<string>("");
  const isErrorEmail = email === "";
  const [password, setPassword] = useState<string>("");
  const isErrorPassword = password === "";
  const [show, setShow] = useState<boolean>(false);

  const handleSubmit = async () => {
    try {
      const authData = await login(apiContext.axios, email, password);
      authContext.login(authData);

      navigate(-1);
    } catch (e) {
      if (e instanceof ApiError) {
        alert(e.message);
      }
    }
  }
  
  return (
    <Box h="100vh" w="100vw" display="flex" bg="#4099f8">
      <Container boxShadow="2xl" p="6" rounded="md" bg="white" mx="auto" my="auto" centerContent>
        <Text as="h1" fontSize="2xl">Masuk ke HireMIF</Text>
        <Container as="form" mt="2rem" onSubmit={e => {
          e.preventDefault();
          handleSubmit();
        }}>
          <FormControl isInvalid={isErrorEmail}>
            <FormLabel>Email</FormLabel>
            <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="john.doe@gmail.com" />
            {!isErrorEmail ? (
              <></>
            ) : (
              <FormErrorMessage>Email is required.</FormErrorMessage>
            )}
          </FormControl>
          <FormControl isInvalid={isErrorPassword}>
            <FormLabel>Password</FormLabel>
            <InputGroup>
              <Input value={password} onChange={e => setPassword(e.target.value)} type={show ? "text" : "password"} placeholder="*******" />
              <InputRightElement width="4.5rem">
                <Button h="1.75rem" size="sm" onClick={e => setShow(!show)}>
                  {show ? "Hide" : "Show"}
                </Button>
              </InputRightElement>
            </InputGroup>
            {!isErrorPassword ? (
              <></>
            ) : (
              <FormErrorMessage>Password is required.</FormErrorMessage>
            )}
          </FormControl>
          <Button bg="#4099f8" color="white" w="100%" type="submit" mt="2rem">Login</Button>
        </Container>
        <Container display="flex" justifyContent="space-between" mt="2rem">
          <Text>Belum memiliki akun?</Text>
          <Button bg="#4099f8" color="white" onClick={() => navigate("/register")}>Register</Button>
        </Container>
      </Container>
    </Box>
  )
}

export default Login;