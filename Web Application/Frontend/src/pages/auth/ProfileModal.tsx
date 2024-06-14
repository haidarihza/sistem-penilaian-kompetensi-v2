import React from "react";
import ModalTemplate from "../../components/ModalTemplate";
import {
  FormControl,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import { ProfileData } from "../../interface/auth";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  handleSubmit: () => Promise<void>;
  title: string;
  buttonContent?: string;
  profileData: ProfileData;
  setProfileData: (value: ProfileData) => void;
}

const ProfileModal = ({
  isOpen,
  onClose,
  handleSubmit,
  title,
  buttonContent,
  profileData,
  setProfileData,
}: Props) => {
  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({ ...profileData, name: event.target.value });
  };
  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({ ...profileData, phone: event.target.value });
  };
  return (
    <ModalTemplate
      isOpen={isOpen}
      onClose={onClose}
      handleSubmit={handleSubmit}
      title={title}
      buttonContent={buttonContent}
      isForm={true}
      size="2xl"
    >
      <FormControl isRequired mb="4">
        <FormLabel>Nama</FormLabel>
        <Input value={profileData.name} onChange={handleNameChange} placeholder="Nama" mt="-2"/>
      </FormControl>
      <FormControl isRequired mb="4">
        <FormLabel>No Telepon</FormLabel>
        <Input value={profileData.phone} onChange={handlePhoneChange} placeholder="62123456789" mt="-2"/>
      </FormControl>
    </ModalTemplate>
  );
};

export default ProfileModal;