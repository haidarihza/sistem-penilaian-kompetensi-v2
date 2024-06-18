import React, {  } from "react";
import { Competency, CompetencyLevel } from "../../interface/competency";
import ModalTemplate from "../../components/ModalTemplate";
import {
  Button,
  Box,
  IconButton,
  Text,
  FormControl,
  FormLabel,
  Input,
  Textarea,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  handleSubmit: () => Promise<void>;
  title: string;
  buttonContent?: string;
  competency: Competency;
  setCompetency: (value: Competency) => void;
}

const CompetencyModal = ({
  isOpen,
  onClose,
  handleSubmit,
  title,
  buttonContent,
  competency,
  setCompetency,
}: Props) => {
  const handleCompetencyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCompetency({ ...competency, competency: event.target.value });
  };
  const handleDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCompetency({ ...competency, description: event.target.value });
  }
  const handleAddLevel = () => {
    const newLevels = [...competency.levels, {
      level: "",
      description: ""
    } as CompetencyLevel]
    setCompetency({ ...competency, levels: newLevels });
  }
  const handleDeleteLevel = (idx: number) => {
    setCompetency({ ...competency, levels: competency.levels.filter((_, index) => index !== idx) });
  }
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
        <FormLabel>Kompetensi</FormLabel>
        <Input value={competency.competency} onChange={handleCompetencyChange} placeholder="Kompetensi" mt="-2"/>
      </FormControl>
      <FormControl isRequired mb="4">
        <FormLabel>Deskripsi</FormLabel>
        <Textarea value={competency.description} onChange={handleDescriptionChange} placeholder="Deskripsi" mt="-2"/>
      </FormControl>
      <Text fontSize="lg" fontWeight="bold" mt="4">
        Tingkat Kompetensi
      </Text>
      {competency.levels?.map((level, idx) => (
      <Box key={idx} mt="2" display="flex" alignItems="center" justifyContent="space-between" border="1px" borderColor="main_blue" rounded="md" p="2">
        <Box w="85%">
          <FormControl>
            <FormLabel>Level</FormLabel>
            <Input value={level.level} onChange={e => setCompetency({...competency, levels: competency.levels.map((val, index) => {
              if (index === idx) {
                return { ...val, level: e.target.value }
              }
              return val;
            })})} placeholder="Tingkat" mt="-2"/>
          </FormControl>
          <FormControl mt="2">
            <FormLabel>Deskripsi</FormLabel>
            <Textarea value={level.description} onChange={e => setCompetency({...competency, levels: competency.levels.map((val, index) => {
              if (index === idx) {
                return { ...val, description: e.target.value }
              }
              return val;
            })})} placeholder="Deskripsi" mt="-2"/>
          </FormControl>
        </Box>
        <IconButton aria-label="Delete" bg="main_blue" color="white" icon={<DeleteIcon />} onClick={() => handleDeleteLevel(idx)} />
      </Box>
      ))}
      <Button
        mt="4"
        bg="main_blue"
        color="white"
        onClick={handleAddLevel}
      >
        Tambah +
      </Button>
    </ModalTemplate>
  );
};

export default CompetencyModal;