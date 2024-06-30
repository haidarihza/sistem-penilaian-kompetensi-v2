import React, {  } from "react";
import { Competency, CompetencyLevel } from "../../interface/competency";
import { Feedback } from "../../interface/feedback";
import ModalTemplate from "../../components/ModalTemplate";
import {
  Button,
  Box,
  Text,
  FormControl,
  Input,
  TableContainer,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Container,
  RadioGroup,
  HStack,
  Radio,
} from "@chakra-ui/react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  handleSubmit: () => Promise<void>;
  title: string;
  competency: Competency;
  feedback: Feedback;
  setFeedback: (feedback: Feedback) => void;
}

const DetailFeedbackModal = ({
  isOpen,
  onClose,
  handleSubmit,
  title,
  competency,
  feedback,
  setFeedback,
}: Props) => {
  const handleFeedbackChange = (value: string) => {
    setFeedback({ ...feedback, label_feedback: value });
  };

  const getCompetencyLevel = (level_id: string) => {
    return competency.levels.find((level) => level.id === level_id);
  };

  return (
    <ModalTemplate
      isOpen={isOpen}
      onClose={onClose}
      handleSubmit={handleSubmit}
      title={title}
      isForm={false}
      size="4xl"
    >
      <Box>
        <Box bg="main_beige" p="1" w="fit-content" rounded="md">
          <Text>Transkrip Interview</Text>
        </Box>
        <Text mt="2" fontSize="sm">{feedback.transcript}</Text>
        <Box bg="main_beige" p="1" w="fit-content" rounded="md" mt="4">
          <Text>Kompetensi: <b>{competency.competency}</b></Text>
        </Box>
        <Box display="flex" flexDir="column" justifyContent="space-between" mt="2">
          <Text fontSize="sm" mb="4" mt="2">{competency.description}</Text>
          <TableContainer>
            <Table size="sm" colorScheme="blue">
              <Thead>
                <Tr>
                  <Th textAlign="center">Level</Th>
                  <Th textAlign="center" w="80%">Deskripsi</Th>
                </Tr>
              </Thead>
              <Tbody>
                {competency.levels.map((level: CompetencyLevel) => (
                  <Tr key={level.id}>
                    <Td textAlign="center">{level.level}</Td>
                    <Td w="80%" whiteSpace="normal" overflow="hidden" textOverflow="ellipsis">{level.description}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
        <Text fontSize="sm" mt="2">Result: <b>Level {getCompetencyLevel(feedback.label_result)?.level}</b></Text>
        <Box bg="main_beige" p="1" w="fit-content" rounded="md" mt="4">
          <Text>Feedback</Text>
        </Box>
        <Text fontSize="sm" mt="2">Pilih level yang tepat berdasarkan hasil transkrip dan deskripsi kompetensi</Text>
        <FormControl mt="2" isRequired>
          <RadioGroup onChange={handleFeedbackChange} value={feedback.label_feedback}>
            <HStack spacing="8">
              {competency.levels.map((level: CompetencyLevel) => (
                <Radio size="md" key={level.id} value={level.id}>{level.level}</Radio>
              ))}
            </HStack>
          </RadioGroup>
        </FormControl>
        <Button type="submit" bg="main_blue" color="white" mt="2" isDisabled={feedback.label_feedback === ""} onClick={handleSubmit}>Beri Feedback</Button>
      </Box>
    </ModalTemplate>
  );
};

export default DetailFeedbackModal;