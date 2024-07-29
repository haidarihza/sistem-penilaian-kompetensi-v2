import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../utils/context/auth";
import { register } from "../../api/auth";
import { ApiContext } from "../../utils/context/api";
import { ApiError } from "../../interface/api";
import ToastModal from "../../components/ToastModal";
import {
  Link,
  Box,
  Container,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Text,
  Input,
  InputGroup,
  Select,
  Button,
  InputRightElement,
  useToast,
  Image } from "@chakra-ui/react"

const Register = () => {
  const authContext = useContext(AuthContext);
  const apiContext = useContext(ApiContext);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (authContext.isAuthenticated) {
      navigate("/")
    }
  }, []);

  const roleList: Array<string> = ["INTERVIEWEE", "INTERVIEWER", "HRD"];

  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [role, setRole] = useState<string>("");
  const [isErrorName, setIsErrorName] = useState<boolean>(false);
  const [isErrorPhone, setIsErrorPhone] = useState<boolean>(false);
  const [isErrorEmail, setIsErrorEmail] = useState<boolean>(false);
  const [isErrorPassword, setIsErrorPassword] = useState<boolean>(false);
  const [isErrorConfirmPassword, setIsErrorConfirmPassword] = useState<boolean>(false);
  const [isErrorRole, setIsErrorRole] = useState<boolean>(false);
  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const handleSubmit = async () => {
    try {
      setIsSubmit(true);
      setIsErrorName(name === "");
      setIsErrorPhone(phone === "");
      setIsErrorEmail(email === "");
      setIsErrorPassword(password.length < 8);
      setIsErrorConfirmPassword(password !== confirmPassword || confirmPassword === "");
      setIsErrorRole(role === "");
      if (name === "" || phone === "" || email === "" || password === "" || password !== confirmPassword || role === "") {
        return;
      }
      await register(apiContext.axios, name, phone, email, password, role);
      ToastModal(toast, "Success!", "Akun berhasil dibuat. Email verifikasi telah dikirim ke email Anda", "success");
      navigate("/login");
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
      <Container boxShadow="2xl" p="6" rounded="md" bg="white" mx="auto" mt="4">
        <Text as="h1" fontSize="3xl" justifyItems="left" fontWeight="extrabold" textColor="main_blue">Daftar HireMIF!</Text>
        <Container as="form" mt="2rem" onSubmit={e => {
          e.preventDefault();
          handleSubmit();
        }}>
          <FormControl isInvalid={isErrorName && isSubmit} mb="4">
            <FormLabel>Nama</FormLabel>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" mt="-2"/>
            {!isErrorName ? (
              <></>
            ) : (
              <FormErrorMessage>Nama wajib diisi.</FormErrorMessage>
            )}
          </FormControl>
          <FormControl isInvalid={isErrorPhone && isSubmit} mb="4">
            <FormLabel>Nomor Telepon</FormLabel>
            <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="628123456789" mt="-2"/>
            {!isErrorPhone ? (
              <></>
            ) : (
              <FormErrorMessage>Nomor Telepon wajib diisi.</FormErrorMessage>
            )}
          </FormControl>
          <FormControl isInvalid={isErrorEmail && isSubmit} mb="4">
            <FormLabel>Email</FormLabel>
            <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="john.doe@gmail.com" mt="-2"/>
            {!isErrorEmail ? (
              <></>
            ) : (
              <FormErrorMessage>Email wajib diisi.</FormErrorMessage>
            )}
          </FormControl>
          <FormControl isInvalid={isErrorPassword && isSubmit} mb="4">
            <FormLabel>Password</FormLabel>
            <InputGroup>
              <Input value={password} onChange={e => setPassword(e.target.value)} type={showPassword ? "text" : "password"} placeholder="*******" mt="-2" />
              <InputRightElement width="4.5rem" mt="-2">
                <Button h="1.75rem" size="sm" onClick={e => setShowPassword(!showPassword)} bg="main_blue" textColor="white" _hover={{ bg: "second_blue" }}>
                  {showPassword ? "Hide" : "Show"}
                </Button>
              </InputRightElement>
            </InputGroup>
            {!isErrorPassword ? (
              <></>
            ) : (
              <FormErrorMessage>Password minimal 8 karakter.</FormErrorMessage>
            )}
          </FormControl>
          <FormControl isInvalid={isErrorConfirmPassword && isSubmit} mb="4">
            <FormLabel>Konfirmasi Password</FormLabel>
            <InputGroup>
              <Input value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} type={showConfirmPassword ? "text" : "password"} placeholder="*******" mt="-2" />
              <InputRightElement width="4.5rem" mt="-2">
                <Button h="1.75rem" size="sm" onClick={e => setShowConfirmPassword(!showConfirmPassword)} bg="main_blue" textColor="white" _hover={{ bg: "second_blue" }}>
                  {showConfirmPassword ? "Hide" : "Show"}
                </Button>
              </InputRightElement>
            </InputGroup>
            {!isErrorConfirmPassword ? (
              <></>
            ) : (
              <FormErrorMessage>Konfirmasi Password harus sama dengan password.</FormErrorMessage>
            )}
          </FormControl>
          <FormControl isInvalid={isErrorRole && isSubmit} mb="4">
            <FormLabel>Role</FormLabel>
            <Select value={role} onChange={e => setRole(e.target.value)} placeholder="Select Role" mt="-2">
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
          <Button bg="main_blue" color="white" w="100%" type="submit" mt="2rem" _hover={{ bg: "second_blue" }}>Register</Button>
        </Container>
      </Container>
      <Container display="flex" justifyContent="center" my="2rem">
        <Text>
        Sudah memiliki akun?{" "}
        <Link
          as="span"
          color="main_blue"
          fontWeight="bold"
          textDecoration="underline"
          _hover={{ color: "second_blue" }}
          onClick={() => navigate("/login")}
        >
          Masuk
        </Link>
        </Text>
      </Container>
    </Box>
  )
}

export default Register;