import { Avatar, Box, IconButton, Text, useDisclosure } from "@chakra-ui/react";
import Layout from "../../components/Layout";
import { useContext, useEffect, useState } from "react";
import { profile, updatePassword, updateProfile } from "../../api/auth";
import { ApiContext } from "../../utils/context/api";
import { ApiError } from "../../interface/api";
import { EmailIcon, PhoneIcon, EditIcon } from "@chakra-ui/icons";
import ModalForm from "../../components/ModalForm";
import { FormField } from "../../interface/util";

const Profile = () => {
  const apiContext = useContext(ApiContext);

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
        alert(e.message);
      }
    }
  }

  useEffect(() => {
    fetch();
  }, [IsOpenProfile]);

  const handleSubmitProfile = async () => {
    try {
      await updateProfile(apiContext.axios, name, phone);
    } catch (e) {
      if (e instanceof ApiError) {
        alert(e.message);
      }
    }
    onCloseProfile();
  }

  const handleSubmitPassword = async () => {
    try {
      await updatePassword(apiContext.axios, currentPassword, newPassword);
    } catch (e) {
      if (e instanceof ApiError) {
        alert(e.message);
      }
    }
    onClosePassword();
  }
  
  return (
    <Layout>
      <ModalForm
        isOpen={IsOpenProfile} 
        onClose={onCloseProfile} 
        handleSubmit={handleSubmitProfile}
        title="Ubah Profile"
        fields={profileFields}
      />
      <ModalForm 
        isOpen={IsOpenPassword} 
        onClose={onClosePassword} 
        handleSubmit={handleSubmitPassword}
        title="Ubah Password"
        fields={passwordFields}
      />
      <Box boxShadow="2xl" p="6" rounded="md" bg="white" display="flex" mx="auto" mt="10">
        <Box display="flex" my="auto" mr="5">
          <Avatar size="lg" mr="2" />
          <Text as="h1" fontSize="2xl" fontWeight="semibold" my="auto">{name}</Text>
        </Box>
        <Box display="flex" flexDir="column">
          <Box display="flex">
            <PhoneIcon mr="2" />
            <Text as="p" fontSize="lg">{phone}</Text>
          </Box>
          <Box display="flex">
            <EmailIcon mr="2" />
            <Text as="p" fontSize="lg">{email}</Text>
          </Box>
          <Box mt="3" display="flex" flexDir="row-reverse">
            <IconButton aria-label="Edit Profile" size="xs" icon={<EditIcon />} onClick={onOpenProfile} />
            <Text fontSize="xs" mr="1">Ubah Profile</Text>
          </Box>
          <Box mt="1" display="flex" flexDir="row-reverse">
            <IconButton aria-label="Edit Password" size="xs" icon={<EditIcon />} onClick={onOpenPassword} />
            <Text fontSize="xs" mr="1">Ubah Password</Text>
          </Box>
        </Box>
      </Box>
    </Layout>
  )
}

export default Profile;