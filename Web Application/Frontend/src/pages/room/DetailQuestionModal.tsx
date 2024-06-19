import React from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Text } from '@chakra-ui/react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  question: string;
  transcript: string;
}

const DetailQuestionModal = ({isOpen, onClose, question, transcript}: Props) => {
  return(
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>Detail Pertanyaan</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <Text as="h1" fontWeight="semibold">Pertanyaan</Text>
        <Text>{question}</Text>
        <Text as="h1" fontWeight="semibold" mt="2">Transkrip Jawaban Kandidat</Text>
        <Text>{transcript !== "" ? transcript : "Belum Ada Hasil"}</Text>
      </ModalBody>
    </ModalContent>
  </Modal>
  );
};

export default DetailQuestionModal;