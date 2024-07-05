import React, { useState, useEffect } from "react";
import ModalTemplate from "../../components/ModalTemplate";
import { Question } from "../../interface/question";
import { RoomCreate, RoomGroupCreate } from "../../interface/room";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  IconButton,
  Box,
  Text,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { Competency } from "../../interface/competency";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  handleSubmit: () => Promise<void>;
  title: string;
  buttonContent?: string;
  questionCollections: Array<Question>;
  competencyCollections: Array<Competency>;
  roomGroup: RoomGroupCreate;
  setRoomGroup: (roomGroup: RoomGroupCreate) => void;
}

const QuestionsListModal = ({
  isOpen,
  onClose,
  handleSubmit,
  title,
  buttonContent,
  questionCollections,
  competencyCollections,
  roomGroup,
  setRoomGroup,
}: Props) => {
  const [filteredQuestionCollections, setFilteredQuestionCollections] = useState<Array<Question>>([] as Array<Question>);

  useEffect(() => {
    setFilteredQuestionCollections(
      questionCollections.filter(
        (val) => !roomGroup.room.questions.map((question) => question.id).includes(val.id)
      )
    );
  }, [questionCollections, roomGroup.room]);

  const handleAddQuestion = (question: Question) => {
    const newRoom = { ...roomGroup.room } as RoomCreate;
    newRoom.questions.push(question);
    setRoomGroup({ ...roomGroup, room: newRoom });
  };

  return (
    <ModalTemplate
      isOpen={isOpen}
      onClose={onClose}
      handleSubmit={handleSubmit}
      title={title}
      buttonContent={buttonContent}
      isForm={false}
      size="3xl"
    >
      <TableContainer bg="white" rounded="md">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th textTransform="capitalize" w="40%">Pertanyaan</Th>
              <Th textTransform="capitalize" textAlign="center">Batas Durasi</Th>
              <Th textTransform="capitalize" w="30%" textAlign="center">Label</Th>
              <Th textTransform="capitalize" textAlign="center">Aksi</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredQuestionCollections.map((val) => (
              <Tr key={val.id}>
                <Td w="50%" whiteSpace="normal" overflow="hidden" textOverflow="ellipsis">{val.question}</Td>
                <Td textAlign="center">{val.duration_limit} menit</Td>
                <Td textAlign="center">
                  <Box display="flex" flexDir="row" p="0" flexWrap="wrap" justifyContent="center">
                    {val.labels.map((val, idx) => (
                    <Box key={idx} display="flex" alignItems="center" w="fit-content" rounded="md" bg="main_blue" mr="2" mb="2">
                      <Text fontSize="sm" fontWeight="normal" color="white" pl="1" pr="1">
                        {competencyCollections.find((label) => label.id === val.competency_id)?.competency}
                      </Text>
                    </Box>
                    ))}
                  </Box>
                </Td>                
                <Td>
                  <IconButton size="sm" aria-label="Add" bg="main_blue" color="white" icon={<AddIcon />} onClick={() => handleAddQuestion(val)} />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </ModalTemplate>
  );
};

export default QuestionsListModal;