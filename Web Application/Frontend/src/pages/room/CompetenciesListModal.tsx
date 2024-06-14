import React, { useState, useEffect } from "react";
import ModalTemplate from "../../components/ModalTemplate";
import { Competency } from "../../interface/competency";
import { RoomCreate } from "../../interface/room";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Text,
  IconButton,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { Question } from "../../interface/question";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  handleSubmit: () => Promise<void>;
  title: string;
  buttonContent?: string;
  competencyCollections: Array<Competency>;
  questionCollections: Array<Question>;
  room: RoomCreate;
  setRoom: (value: RoomCreate) => void;
}

const CompetenciesListModal = ({
  isOpen,
  onClose,
  handleSubmit,
  title,
  buttonContent,
  competencyCollections,
  questionCollections,
  room,
  setRoom,
}: Props) => {
  const [filteredCompetencyCollections, setFilteredCompetencyCollections] = useState<Array<Competency>>([] as Array<Competency>);

  useEffect(() => {
    setFilteredCompetencyCollections(
      competencyCollections.filter(
        (competency) => room.competencies.length === 0 || !room.competencies.map((val) => val?.id).includes(competency.id)
      )
    );
  }, [competencyCollections, room]);

  const handleAddCompetency = (competency: Competency) => {
    const newRoom = { ...room };
    newRoom.competencies.push(competency);
    // Add questions that have the same competency_id from labels as the selected competency
    const questions = questionCollections.filter((question) => 
      question.labels.some((label) => label.competency_id === competency.id)
    );
    // Check if the question is already in the room
    questions.forEach((question) => {
      if (!newRoom.questions.map((val) => val.id).includes(question.id)) {
        newRoom.questions.push(question);
      }
    });
    setRoom(newRoom);
  };

  return (
    <ModalTemplate
      isOpen={isOpen}
      onClose={onClose}
      handleSubmit={handleSubmit}
      title={title}
      buttonContent={buttonContent}
      isForm={false}
      size="5xl"
    >
      <TableContainer bg="white" rounded="md">
        <Table variant="simple" colorScheme="blue">
          <Thead>
            <Tr>
              <Th textTransform="capitalize" w="20%">Kompetensi</Th>
              <Th textTransform="capitalize" textAlign="center" w="60%">Deskripsi</Th>
              <Th textTransform="capitalize" textAlign="center" w="10%">Level</Th>
              <Th textTransform="capitalize" textAlign="center">Aksi</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredCompetencyCollections.map((val) => (
              <Tr key={val.id}>
                <Td w="20%">{val.competency}</Td>
                <Td w="60%" whiteSpace="normal" overflow="hidden" textOverflow="ellipsis">
                  {val.description}
                </Td>
                <Td w="10%">
                  {val.levels.map((level) => (
                    <Text maxW="10rem" noOfLines={1} key={level.id}>{level.level}</Text>
                  ))}
                </Td>
                <Td>
                  <IconButton size="sm" aria-label="Add" bg="main_blue" color="white" icon={<AddIcon />} onClick={() => handleAddCompetency(val)} />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </ModalTemplate>
  );
};

export default CompetenciesListModal;