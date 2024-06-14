import React from "react";
import ModalTemplate from "../../components/ModalTemplate";
import {
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Button,
} from "@chakra-ui/react";
import { UpdatePassword } from "../../interface/auth";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  handleSubmit: () => Promise<void>;
  title: string;
  buttonContent?: string;
  updatePasswordData: UpdatePassword;
  setUpdatePasswordData: (value: UpdatePassword) => void;
}

const ChangePasswordModal = ({
  isOpen,
  onClose,
  handleSubmit,
  title,
  buttonContent,
  updatePasswordData,
  setUpdatePasswordData,
}: Props) => {
  const [showCurrentPassword, setShowCurrentPassword] = React.useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = React.useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState<boolean>(false);

  const handleCurrentPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUpdatePasswordData({ ...updatePasswordData, current_password: event.target.value });
  };
  const handleNewPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUpdatePasswordData({ ...updatePasswordData, new_password: event.target.value });
  };
  const handleConfirmPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUpdatePasswordData({ ...updatePasswordData, confirm_password: event.target.value });
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
      <FormLabel>Password Saat Ini</FormLabel>
        <InputGroup>
          <Input value={updatePasswordData.current_password} onChange={handleCurrentPasswordChange} type={showCurrentPassword ? "text" : "password"} placeholder="*******" mt="-2" />
          <InputRightElement width="4.5rem" mt="-2">
            <Button h="1.75rem" size="sm" onClick={e => setShowCurrentPassword(!showCurrentPassword)} bg="main_blue" textColor="white" _hover={{ bg: "second_blue" }}>
              {showCurrentPassword ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <FormControl isRequired mb="4">
        <FormLabel>Password Baru</FormLabel>
        <InputGroup>
          <Input value={updatePasswordData.new_password} onChange={handleNewPasswordChange} type={showNewPassword ? "text" : "password"} placeholder="*******" mt="-2" />
          <InputRightElement width="4.5rem" mt="-2">
            <Button h="1.75rem" size="sm" onClick={e => setShowNewPassword(!showNewPassword)} bg="main_blue" textColor="white" _hover={{ bg: "second_blue" }}>
              {showNewPassword ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <FormControl isRequired mb="4">
        <FormLabel>Konfirmasi Password Baru</FormLabel>
        <InputGroup>
          <Input value={updatePasswordData.confirm_password} onChange={handleConfirmPasswordChange} type={showConfirmPassword ? "text" : "password"} placeholder="*******" mt="-2" />
          <InputRightElement width="4.5rem" mt="-2">
            <Button h="1.75rem" size="sm" onClick={e => setShowConfirmPassword(!showConfirmPassword)} bg="main_blue" textColor="white" _hover={{ bg: "second_blue" }}>
              {showConfirmPassword ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
    </ModalTemplate>
  );
};

export default ChangePasswordModal;