import { Avatar, Box, IconButton, Text, useDisclosure, Container, Button } from "@chakra-ui/react";
import Layout from "../../components/Layout";
import { useContext, useEffect, useState } from "react";
import { profile, updatePassword, updateProfile } from "../../api/auth";
import { ApiContext } from "../../utils/context/api";
import { ApiError } from "../../interface/api";
import { EmailIcon, PhoneIcon, EditIcon } from "@chakra-ui/icons";
import ModalForm from "../../components/ModalForm";
import { ProfileData, UpdatePassword } from "../../interface/auth";
import ToastModal from "../../components/ToastModal";
import { useToast } from "@chakra-ui/react";
import ProfileModal from "./ProfileModal";
import ChangePasswordModal from "./ChangePasswordModal";


const Profile = () => {
  const apiContext = useContext(ApiContext);
  const toast = useToast();
  const [profileData, setProfileData] = useState<ProfileData>({name: "", phone: "", email: ""});
  const [updatePasswordData, setUpdatePasswordData] = useState<UpdatePassword>({current_password: "", new_password: "", confirm_password: ""});

  const { isOpen:IsOpenProfile, onOpen:onOpenProfile, onClose:onCloseProfile } = useDisclosure();
  const { isOpen:IsOpenPassword, onOpen:onOpenPassword, onClose:onClosePassword } = useDisclosure();
  
  const fetch = async () => {
    try {
      const prof = await profile(apiContext.axios);
      setProfileData(prof);
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
      await updateProfile(apiContext.axios, profileData.name, profileData.phone);
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
      if (updatePasswordData.new_password !== updatePasswordData.confirm_password) {
        return;
      }
      await updatePassword(apiContext.axios, updatePasswordData.current_password, updatePasswordData.new_password);
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
      <ProfileModal 
        isOpen={IsOpenProfile} 
        onClose={onCloseProfile} 
        handleSubmit={handleSubmitProfile}
        title="Ubah Profil"
        profileData={profileData}
        setProfileData={setProfileData}
        buttonContent="Ubah"
      />
      <ChangePasswordModal 
        isOpen={IsOpenPassword} 
        onClose={onClosePassword} 
        handleSubmit={handleSubmitPassword}
        title="Ubah Password"
        updatePasswordData={updatePasswordData}
        setUpdatePasswordData={setUpdatePasswordData}
        buttonContent="Ubah"
      />
      <Container boxShadow="2xl" p="6" rounded="md" bg="white" mx="auto" mt="4">
        <Box display="flex" my="auto" mr="5" justifyContent="center" mb="4">
          <Avatar size="2xl" mr="2" bg="main_blue"/>
        </Box>
        <Box display="flex" my="auto" mr="5" justifyContent="center" mb="6">
          <Text as="h1" fontSize="2xl" fontWeight="semibold" my="auto">{profileData.name}</Text>
        </Box>
        <Box display="flex" alignItems="center" mb="4">
          <PhoneIcon color="main_blue" boxSize="6" mr="4"/>
          <Text as="p" fontSize="lg">{profileData.phone}</Text>
        </Box>
        <Box display="flex" alignItems="center" mb="4">
          <EmailIcon color="main_blue" boxSize="6" mr="4"/>
          <Text as="p" fontSize="lg">{profileData.email}</Text>
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