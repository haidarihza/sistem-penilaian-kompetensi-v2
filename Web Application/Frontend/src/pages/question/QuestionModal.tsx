import React, { useEffect, useState } from "react";
import { Question, QuestionLabel, QuestionLabelOptions } from "../../interface/question";
import ModalTemplate from "../../components/ModalTemplate";
import {
  Box,
  IconButton,
  Text,
  FormControl,
  FormLabel,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Textarea,
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import { orgPosition } from "../../utils/utils";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  handleSubmit: () => Promise<void>;
  title: string;
  buttonContent?: string;
  question: Question;
  labelOptions: Array<QuestionLabelOptions>;
  setQuestion: (question: Question) => void;
}

const QuestionModal = ({
  isOpen,
  onClose,
  handleSubmit,
  title,
  buttonContent,
  question,
  labelOptions,
  setQuestion,
}: Props) => {
  const [filteredLabels, setFilteredLabels] = useState<Array<QuestionLabelOptions>>([] as Array<QuestionLabelOptions>);
  const [selectedLabel, setSelectedLabel] = useState('');

  useEffect(() => {
    setFilteredLabels(
      labelOptions.filter(
        (label) => question.labels.length === 0 || !question.labels.map((val) => val?.competency_id).includes(label.id)
      )
    )
  }, [question, labelOptions]); 

  const handleQuestionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuestion({ ...question, question: e.target.value });
  };
  const handleDurationChange = (valueAsString: string, valueAsNumber: number) => {
    setQuestion({ ...question, duration_limit: valueAsNumber });
  };
  const handleDeleteLabel = (idx: number) => () => {
    const newLabels = question.labels.filter((_, index) => index !== idx) as Array<QuestionLabel>;
    setQuestion({ ...question, labels: newLabels });
    setFilteredLabels(labelOptions.filter((label) => !newLabels.map((val) => val.competency_id).includes(label.id)));
  };
  const handleAddLabel = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLabel = labelOptions.find((val) => val.competency === e.target.value);
    if (selectedLabel) {
      const newLabels = question.labels.concat({ id: "", competency_id: selectedLabel.id });
      setQuestion({ ...question, labels: newLabels });
      setFilteredLabels(labelOptions.filter((label) => !newLabels.map((val) => val.competency_id).includes(label.id)));
    }
    setSelectedLabel('');
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
        <FormLabel htmlFor="question">Pertanyaan</FormLabel>
        <Textarea value={question.question} onChange={handleQuestionChange} placeholder="Pertanyaan" mt="-2"/>
      </FormControl>
      <FormControl isRequired mb="4">
        <FormLabel htmlFor="duration">Durasi (menit)</FormLabel>
        <NumberInput id="duration" value={question.duration_limit} onChange={handleDurationChange} min={1}>
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      </FormControl>
      <FormControl mb="4">
        <FormLabel htmlFor="org_position">Posisi Organisasi</FormLabel>
        <Select id="org_position" placeholder="Pilih Posisi Organisasi" value={question.org_position} onChange={(e) => setQuestion({ ...question, org_position: e.target.value })}>
          {orgPosition.map((val, i) => (
            <option key={i} value={val}>{val}</option>
          ))}
        </Select>
      </FormControl>
      <FormControl mb="4">
        <FormLabel >Kategori Kompetensi</FormLabel>
        <Box display="flex" flexDir="row" p="0" flexWrap="wrap">
        {question.labels.map((val, idx) => (
        <Box key={idx} display="flex" alignItems="center" w="fit-content" rounded="md" bg="second_blue" mr="2" mb="2">
          <Text fontSize="sm" fontWeight="normal" color="white" ml="1">
            {labelOptions.find((label) => label.id === val.competency_id)?.competency}
          </Text>
          <IconButton
            aria-label="Delete"
            icon={<CloseIcon />}
            colorScheme="white.400"
            size="xs"
            onClick={handleDeleteLabel(idx)}
            sx={{
              fontSize: '8px',
              width: '16px',
              height: '16px',
              padding: '2px'
            }}
          />
        </Box>
        ))}
        </Box>
        <Select value={selectedLabel} onChange={handleAddLabel} placeholder="Tambah Kategori Kompetensi">
          {filteredLabels.map((val, i) => (
            <option key={i} value={val.competency}>{val.competency}</option>
          ))}
        </Select>
      </FormControl>
    </ModalTemplate>
  );
};

export default QuestionModal;