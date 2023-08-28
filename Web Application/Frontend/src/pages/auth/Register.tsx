import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../utils/context/auth";
import { login, register } from "../../api/auth";
import { ApiContext } from "../../utils/context/api";
import { ApiError } from "../../interface/api";
import { Box, Container, FormControl, FormLabel, FormErrorMessage, Text, Input, InputGroup, Select, Button, InputRightElement } from "@chakra-ui/react"

const Register = () => {
  const authContext = useContext(AuthContext);
  const apiContext = useContext(ApiContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (authContext.isAuthenticated) {
      navigate("/")
    }
  }, []);

  const roleList: Array<string> = ["INTERVIEWEE", "INTERVIEWER"];

  const [name, setName] = useState<string>("");
  const isErrorName = name === "";
  const [phone, setPhone] = useState<string>("");
  const isErrorPhone = phone === "";
  const [email, setEmail] = useState<string>("");
  const isErrorEmail = email === "";
  const [password, setPassword] = useState<string>("");
  const isErrorPassword = password === "";
  const [show, setShow] = useState<boolean>(false);
  const [role, setRole] = useState<string>("");
  const isErrorRole = role === "";

  const handleSubmit = async () => {
    try {
      await register(apiContext.axios, name, phone, email, password, role);
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
        <Text as="h1" fontSize="2xl">Bergabung dengan HireMIF sekarang!</Text>
        <Container as="form" mt="2rem" onSubmit={e => {
          e.preventDefault();
          handleSubmit();
        }}>
          <FormControl isInvalid={isErrorName}>
            <FormLabel>Nama</FormLabel>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" />
            {!isErrorName ? (
              <></>
            ) : (
              <FormErrorMessage>Nama wajib diisi.</FormErrorMessage>
            )}
          </FormControl>
          <FormControl isInvalid={isErrorPhone}>
            <FormLabel>Nomor Telepon</FormLabel>
            <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="628123456789" />
            {!isErrorPhone ? (
              <></>
            ) : (
              <FormErrorMessage>Nomor Telepon wajib diisi.</FormErrorMessage>
            )}
          </FormControl>
          <FormControl isInvalid={isErrorEmail}>
            <FormLabel>Email</FormLabel>
            <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="john.doe@gmail.com" />
            {!isErrorEmail ? (
              <></>
            ) : (
              <FormErrorMessage>Email wajib diisi.</FormErrorMessage>
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
              <FormErrorMessage>Password wajib diisi.</FormErrorMessage>
            )}
          </FormControl>
          <FormControl isInvalid={isErrorRole}>
            <FormLabel>Role</FormLabel>
            <Select value={role} onChange={e => setRole(e.target.value)} placeholder="Select Role">
              {roleList.map((role, i) => (
                <option key={i} value={role}>{role}</option>
              ))}
            </Select>
            {!isErrorRole ? (
              <></>
            ) : (
              <FormErrorMessage>Role wajib dipilih.</FormErrorMessage>
            )}
          </FormControl>
          <Button bg="#4099f8" color="white" w="100%" type="submit" mt="2rem">Register</Button>
        </Container>
        <Container display="flex" justifyContent="space-between" mt="2rem">
          <Text>Sudah memiliki akun?</Text>
          <Button bg="#4099f8" color="white" onClick={() => navigate("/login")}>Login</Button>
        </Container>
      </Container>
    </Box>
  )
}

export default Register;