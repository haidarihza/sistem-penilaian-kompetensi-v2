import React, { ReactNode } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  handleSubmit: () => Promise<void>;
  title: string;
  buttonContent?: string;
  isForm: boolean;
  children: ReactNode;
  [key: string]: any;
}

const ModalTemplate = ({
  isOpen,
  onClose,
  handleSubmit,
  title,
  buttonContent = "Kirim",
  isForm = true,
  children,
  ...rest
}: Props) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} {...rest}>
      <ModalOverlay bg="blackAlpha.700"/>
      <ModalContent
        as="form"
        onSubmit={e => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>{children}</ModalBody>
        {isForm && (
          <ModalFooter>
            <Button
              bg="white"
              color="main_blue"
              _hover={{ bg: "second_blue", color: "white" }}
              mr="2"
              onClick={onClose}
            >
              Batal
            </Button>
            <Button
              type="submit"
              bg="main_blue"
              color="white"
              _hover={{ bg: "second_blue" }}
            >
              {buttonContent}
            </Button>
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ModalTemplate;