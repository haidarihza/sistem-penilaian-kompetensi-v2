import Layout from "../../components/Layout";
import { useContext, useEffect, useState } from "react";
import { ApiContext } from "../../utils/context/api";
import { getAllFeedback, updateFeedback } from "../../api/feedback";
import { getAllCompetency } from "../../api/competency";
import { Feedback } from "../../interface/feedback";
import { Competency, CompetencyLevel } from "../../interface/competency";
import { ApiError } from "../../interface/api";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Input,
  Flex, 
  Button, 
  Box,
  Text,
  useDisclosure,
  IconButton,
  useToast,
} from "@chakra-ui/react"
import { EditIcon, DeleteIcon, SmallCloseIcon } from "@chakra-ui/icons";
import ToastModal from "../../components/ToastModal";
import DetailFeedbackModal from "./DetailFeedbackModal";

const Index = () => {
  const apiContext = useContext(ApiContext);
  const toast = useToast();

  const [data, setData] = useState<Array<Feedback>>([] as Array<Feedback>);
  const [currentFeedback, setCurrentFeedback] = useState<Feedback>({
    id: "",
    competency_id: "",
    transcript: "",
    status: "",
    label_result: "",
    label_feedback: "",
  } as Feedback);
  const [competencies, setCompetencies] = useState<Array<Competency>>([] as Array<Competency>);
  const [currentCompetency, setCurrentCompetency] = useState<Competency>({
    id: "",
    competency: "",
    description: "",
    levels: [] as Array<CompetencyLevel>,
  } as Competency);
  const { isOpen:isOpenModal, onOpen:onOpenModal, onClose:onCloseModal } = useDisclosure();


  const fetch = async () => {
    try {
      const feedback = await getAllFeedback(apiContext.axios);
      setData(feedback);
      console.log(feedback);
      const competency = await getAllCompetency(apiContext.axios);
      setCompetencies(competency);
    } catch(e) {
      if (e instanceof ApiError) {
        ToastModal(toast, "Error!", e.message, "error");
      } else {
        ToastModal(toast, "Error!", "Terjadi kesalahan pada server.", "error");
      }
    }
  }
  
  useEffect(() => {
    fetch();
  }, [isOpenModal]);

  const handleOpenDetail = (feedback_id: string, competency_id: string) => () => {
    const feedback = data.find((val) => val.id === feedback_id);
    setCurrentFeedback(feedback as Feedback);
    const competency = competencies.find((val) => val.id === competency_id);
    setCurrentCompetency(competency as Competency);
    onOpenModal();
  }

  const handleUpdateFeedback = async () => {
    try {
      console.log(currentFeedback);
      await updateFeedback(apiContext.axios, currentFeedback);
      ToastModal(toast, "Success!", "Feedback berhasil diperbarui", "success");
      onCloseModal();
    } catch(e) {
      if (e instanceof ApiError) {
        ToastModal(toast, "Error!", e.message, "error");
      } else {
        ToastModal(toast, "Error!", "Terjadi kesalahan pada server.", "error");
      }
    }
  }

  return (
    <Layout>
      <DetailFeedbackModal
        isOpen={isOpenModal}
        onClose={onCloseModal}
        title="Beri Feedback"
        competency={currentCompetency}
        feedback={currentFeedback}
        setFeedback={setCurrentFeedback}
        handleSubmit={handleUpdateFeedback}
      />
      <Text as="h1" fontSize="2xl" fontWeight="semibold">Beri Feedback</Text>
      <TableContainer bg="white" rounded="md" mt="2">
        <Box overflowY="auto" maxH="100%">
          <Table variant="simple" colorScheme="blue">
            <Thead position="sticky" top="0" zIndex="1" bg="white">
              <Tr>
                <Th textTransform="capitalize" w="20%">Kompetensi</Th>
                <Th textTransform="capitalize" w="50%" textAlign="center">Transkrip</Th>
                <Th textTransform="capitalize" w="20%" textAlign="center">Result (Level)</Th>
                <Th textTransform="capitalize" textAlign="center">Aksi</Th>
              </Tr>
            </Thead>
            <Tbody>
            {data.map((val) => (
                <Tr key={val.id}>
                  <Td w="20%">{competencies.find((competency) => competency.id === val.competency_id)?.competency}</Td>
                  <Td w="50%" whiteSpace="normal" overflow="hidden" textOverflow="ellipsis">
                    <Text noOfLines={3}>{val.transcript}</Text>
                  </Td>
                  <Td textAlign="center">{val.label_result}</Td>
                  <Td>
                    <Button bg="main_blue" color="white" size="sm" onClick={handleOpenDetail(val.id, val.competency_id)}>Beri Feedback</Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </TableContainer>
    </Layout>
  )
}

export default Index;