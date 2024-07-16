import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../utils/context/auth";
import { login } from "../../api/auth";
import { ApiContext } from "../../utils/context/api";
import { ApiError } from "../../interface/api";
import ToastModal from "../../components/ToastModal";
import { Box,
  Container,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Text,
  Input,
  InputGroup,
  Button,
  InputRightElement, 
  useToast,
  Image, 
  Link } from "@chakra-ui/react"

const Login = () => {
  const authContext = useContext(AuthContext);
  const apiContext = useContext(ApiContext);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (authContext.isAuthenticated) {
      navigate("/")
    }
  }, []);

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [show, setShow] = useState<boolean>(false);
  const [isErrorEmail, setIsErrorEmail] = useState<boolean>(false);
  const [isErrorPassword, setIsErrorPassword] = useState<boolean>(false);
  const [isSubmit, setIsSubmit] = useState<boolean>(false);


  const handleSubmit = async () => {
    try {
      setIsSubmit(true);
      setIsErrorEmail(email === "");
      setIsErrorPassword(password === "");
      if (email === "" || password === "") {
        return;
      }
      const authData = await login(apiContext.axios, email, password);
      authContext.login(authData);

      console.log(navigate(-1));
      navigate("/");
    } catch (e) {
      if (e instanceof ApiError) {
        ToastModal(toast, "Error!", e.message, "error");
      } else {
        ToastModal(toast, "Error!", "Terjadi kesalahan pada server.", "error");
      }
    }
  }
  
  return (
    <Box h="fit-content" minH="100vh" w="100vw" display="flex" flexDir="column" alignItems="flex-start" bg="main_bg">
      <Image src="../assets/hiremif_logo.png" alt="HireMIF" h="50px" mx="10" mt="6"/>
      <Container boxShadow="2xl" p="6" rounded="md" bg="white" mx="auto" my="auto">
        <Text as="h1" fontSize="3xl" justifyItems="left" fontWeight="extrabold" textColor="main_blue">Masuk HireMIF</Text>
        <Container as="form" mt="2rem" onSubmit={e => {
          e.preventDefault();
          handleSubmit();
        }}>
          <FormControl isInvalid={isErrorEmail && isSubmit} mb="4">
            <FormLabel>Email</FormLabel>
            <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="john.doe@gmail.com" mt="-2"/>
            {!isErrorEmail ? (
              <></>
            ) : (
              <FormErrorMessage>Email is required.</FormErrorMessage>
            )}
          </FormControl>
          <FormControl isInvalid={isErrorPassword && isSubmit} mb="4">
            <FormLabel>Password</FormLabel>
            <InputGroup>
              <Input value={password} onChange={e => setPassword(e.target.value)} type={show ? "text" : "password"} placeholder="*******" mt="-2" />
              <InputRightElement width="4.5rem" mt="-2">
                <Button h="1.75rem" size="sm" onClick={e => setShow(!show)} bg="main_blue" textColor="white" _hover={{ bg: "second_blue" }}>
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
          <Button bg="main_blue" color="white" w="100%" type="submit" mt="2rem" _hover={{ bg: "second_blue" }}>Login</Button>
        </Container>
      </Container>
      <Container display="flex" justifyContent="center" my="auto">
        <Text>
        Belum memiliki akun?{" "}
        <Link
          as="span"
          color="main_blue"
          fontWeight="bold"
          textDecoration="underline"
          _hover={{ color: "second_blue" }}
          onClick={() => navigate("/register")}
        >
          Daftar
        </Link>
        </Text>
      </Container>
    </Box>
  )
}

export default Login;