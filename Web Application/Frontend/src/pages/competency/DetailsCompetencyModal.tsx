import React, {  } from "react";
import { Competency, CompetencyLevel } from "../../interface/competency";
import ModalTemplate from "../../components/ModalTemplate";
import {
  Text,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  TableContainer,
} from "@chakra-ui/react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  handleSubmit: () => Promise<void>;
  title: string;
  competency: Competency;
}

const DetailsCompetencyModal = ({
  isOpen,
  onClose,
  handleSubmit,
  title,
  competency,
}: Props) => {
  return (
    <ModalTemplate
      isOpen={isOpen}
      onClose={onClose}
      handleSubmit={handleSubmit}
      title={title}
      isForm={false}
      size="4xl"
    >
      <Text mb="4">{competency.description}</Text>
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
    </ModalTemplate>
  );
};

export default DetailsCompetencyModal;