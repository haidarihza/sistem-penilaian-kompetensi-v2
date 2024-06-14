import React, {  } from "react";
import { Competency } from "../../interface/competency";
import ModalTemplate from "../../components/ModalTemplate";
import {
  Box,
  Text,
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
      size="2xl"
    >
      <Text mb="4">{competency.description}</Text>
      {competency.levels.map((level, idx) => (
        <Box key={idx} mb="4">
          <Box display="flex" justifyContent="center" justifyItems="center" bg="main_blue" w="20%" rounded="lg">
            <Text fontSize="md" fontWeight="medium" color="white">{level.level}</Text>
          </Box>
          <Text>{level.description}</Text>
        </Box>
      ))}
    </ModalTemplate>
  );
};

export default DetailsCompetencyModal;