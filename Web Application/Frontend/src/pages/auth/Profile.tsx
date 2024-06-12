import { Avatar, Box, IconButton, Text, useDisclosure, Container, Button } from "@chakra-ui/react";
import Layout from "../../components/Layout";
import { useContext, useEffect, useState } from "react";
import { profile, updatePassword, updateProfile } from "../../api/auth";
import { ApiContext } from "../../utils/context/api";
import { ApiError } from "../../interface/api";
import { EmailIcon, PhoneIcon, EditIcon } from "@chakra-ui/icons";
import ModalForm from "../../components/ModalForm";
import { FormField } from "../../interface/util";
import ToastModal from "../../components/ToastModal";
import { useToast } from "@chakra-ui/react";

const Profile = () => {
  const apiContext = useContext(ApiContext);
  const toast = useToast();

  const [name, setName] = useState<string>("");
  const isErrorName = name === "";
  const [phone, setPhone] = useState<string>("");
  const isErrorPhone = phone === "";
  const [email, setEmail] = useState<string>("");

  const [currentPassword, setCurrentPassword] = useState<string>("");
  const isErrorCurrent = currentPassword === "";
  const [newPassword, setNewPassword] = useState<string>("");
  const isErrorNew = newPassword.length < 8;
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const isErrorConfirm = confirmPassword !== newPassword;

  const { isOpen:IsOpenProfile, onOpen:onOpenProfile, onClose:onCloseProfile } = useDisclosure();
  const { isOpen:IsOpenPassword, onOpen:onOpenPassword, onClose:onClosePassword } = useDisclosure();

  const profileFields: Array<FormField> = [
    {
      isInvalid: isErrorName,
      label: "Nama",
      value: name,
      setValue: setName,
      placeholder: "Nama",
      invalidMessage: "Nama wajib diisi"
    },
    {
      isInvalid: isErrorPhone,
      label: "Nomor Telepon",
      value: phone,
      setValue: setPhone,
      placeholder: "Nomor Telepon",
      invalidMessage: "Nomor Telepon wajib diisi"
    },
  ];

  const passwordFields: Array<FormField> = [
    {
      isInvalid: isErrorCurrent,
      label: "Password saat ini",
      type: "password",
      value: currentPassword,
      setValue: setCurrentPassword,
      placeholder: "*********",
      invalidMessage: "Isi password saat ini"
    },
    {
      isInvalid: isErrorNew,
      label: "Password baru",
      type: "password",
      value: newPassword,
      setValue: setNewPassword,
      placeholder: "*********",
      invalidMessage: "Panjang password harus lebih dari 8"
    },
    {
      isInvalid: isErrorConfirm,
      label: "Konfirmasi password baru",
      type: "password",
      value: confirmPassword,
      setValue: setConfirmPassword,
      placeholder: "*********",
      invalidMessage: "Password tidak sesuai"
    },
  ];
  
  const fetch = async () => {
    try {
      const prof = await profile(apiContext.axios);
      setName(prof.name);
      setPhone(prof.phone);
      if (prof.email) {
        setEmail(prof.email);
      }
    } catch(e) {
      if (e instanceof ApiError) {
        ToastModal(toast, "Error!", e.message, "error");
      } else {
        ToastModal(toast, "Error!", "Terjadi kesalahan pada server.", "error");
      }
    }
  }

  useEffect(() => {
    fetch();
  }, [IsOpenProfile]);

  const handleSubmitProfile = async () => {
    try {
      await updateProfile(apiContext.axios, name, phone);
      ToastModal(toast, "Success!", "Profile berhasil diubah", "success");
      onCloseProfile();
    } catch (e) {
      if (e instanceof ApiError) {
        ToastModal(toast, "Error!", e.message, "error");
      } else {
        ToastModal(toast, "Error!", "Terjadi kesalahan pada server.", "error");
      }
    }
  }

  const handleSubmitPassword = async () => {
    try {
      if (currentPassword === "" || newPassword === "" || confirmPassword === "") {
        return;
      }
      if (newPassword !== confirmPassword) {
        return;
      }
      await updatePassword(apiContext.axios, currentPassword, newPassword);
      ToastModal(toast, "Success!", "Password berhasil diubah", "success");
      onClosePassword();
    } catch (e) {
      if (e instanceof ApiError) {
        ToastModal(toast, "Error!", e.message, "error");
      } else {
        ToastModal(toast, "Error!", "Terjadi kesalahan pada server.", "error");
      }
    }
  }
  
  return (
    <Layout>
      <ModalForm
        isOpen={IsOpenProfile} 
        onClose={onCloseProfile} 
        handleSubmit={handleSubmitProfile}
        title="Ubah Profile"
        fields={profileFields}
        buttonContent="Ubah"
      />
      <ModalForm 
        isOpen={IsOpenPassword} 
        onClose={onClosePassword} 
        handleSubmit={handleSubmitPassword}
        title="Ubah Password"
        fields={passwordFields}
        buttonContent="Ubah"
      />
      <Container boxShadow="2xl" p="6" rounded="md" bg="white" mx="auto" mt="4">
        <Box display="flex" my="auto" mr="5" justifyContent="center" mb="4">
          <Avatar size="2xl" mr="2" bg="main_blue"/>
        </Box>
        <Box display="flex" my="auto" mr="5" justifyContent="center" mb="6">
          <Text as="h1" fontSize="2xl" fontWeight="semibold" my="auto">{name}</Text>
        </Box>
        <Box display="flex" alignItems="center" mb="4">
          <PhoneIcon color="main_blue" boxSize="6" mr="4"/>
          <Text as="p" fontSize="lg">{phone}</Text>
        </Box>
        <Box display="flex" alignItems="center" mb="4">
          <EmailIcon color="main_blue" boxSize="6" mr="4"/>
          <Text as="p" fontSize="lg">{email}</Text>
        </Box>
        <Box mt="3" display="flex" flexDir="row-reverse">
          <Button bg="main_blue" color="white" _hover={{ bg: "second_blue" }} onClick={onOpenProfile}>
            Ubah Profil
            <IconButton aria-label="Edit Profile" ml="2" size="xs" icon={<EditIcon/> }/>
          </Button>
        </Box>
      </Container>
      <Container boxShadow="2xl" p="6" rounded="md" bg="white" mx="auto" mt="4">
        <Box display="flex" alignItems="center" mb="4">
          <Text as="h1" fontSize="xl" fontWeight="semibold" my="auto">Password</Text>
        </Box>
        <Box display="flex" alignItems="center" mb="4">
          <Text as="p" fontSize="lg">********</Text>
        </Box>
        <Box mt="3" display="flex" flexDir="row-reverse">
          <Button bg="main_blue" color="white" _hover={{ bg: "second_blue" }} onClick={onOpenPassword}>
            Ubah Password
            <IconButton aria-label="Edit Password" ml="2" size="xs" icon={<EditIcon/> }/>
          </Button>
        </Box>
      </Container>
    </Layout>
  )
}

export default Profile;