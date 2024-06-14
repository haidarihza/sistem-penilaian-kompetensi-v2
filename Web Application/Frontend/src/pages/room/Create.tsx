import { useContext, useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { ApiContext } from "../../utils/context/api";
import { AuthContext } from "../../utils/context/auth";
import { arrayMove } from 'react-sortable-hoc';
import { useNavigate } from "react-router-dom";
import { Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast
 } from "@chakra-ui/react";
import { createRoom } from "../../api/room";
import { ApiError } from "../../interface/api";
import { Question } from "../../interface/question";
import { Competency } from "../../interface/competency";
import { RoomCreate } from "../../interface/room";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { getAllQuestion } from "../../api/question";
import { getAllCompetency } from "../../api/competency";
import ToastModal from "../../components/ToastModal";
import CompetenciesListModal from "./CompetenciesListModal";
import QuestionsListModal from "./QuestionsListModal";
import SortableTableCompetency from "./SortableTableCompetency";
import SortableTableQuestion from "./SortableTableQuestion";


const Detail = () => {
  const apiContext = useContext(ApiContext);
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();
  const toast = useToast();

  const [room, setRoom] = useState<RoomCreate>({
    id: "",
    title: "",
    description: "",
    start: "",
    end: "",
    interview_email: "",
    questions: [] as Array<Question>,
    competencies: [] as Array<Competency>
  });

  const [isSubmit, setIsSubmit] = useState(false);
  const { isOpen:isOpenQuestion, onOpen:onOpenQuestion, onClose:onCloseQuestion } = useDisclosure();
  const { isOpen:isOpenCompetency, onOpen:onOpenCompetency, onClose:onCloseCompetency } = useDisclosure();

  const [questionCollections, setQuestionCollections] = useState<Array<Question>>([]);
  const [competencyCollections, setCompetencyCollections] = useState<Array<Competency>>([]);

  const role = authContext.auth?.role!;
  
  const fetchQ = async () => {
    try {
      const q = await getAllQuestion(apiContext.axios);
      setQuestionCollections(q);
    } catch(e) {
      if (e instanceof ApiError) {
        ToastModal(toast, "Error!", e.message, "error");
      } else {
        ToastModal(toast, "Error!", "Terjadi kesalahan pada sistem", "error");
      }
    }
  }

  const fetchC = async () => {
    try {
      const c = await getAllCompetency(apiContext.axios);
      setCompetencyCollections(c);
    } catch(e) {
      if (e instanceof ApiError) {
        ToastModal(toast, "Error!", e.message, "error");
      } else {
        ToastModal(toast, "Error!", "Terjadi kesalahan pada sistem", "error");
      }
    }
  }
  
  useEffect(() => {
    if (role !== "INTERVIEWER") {
      navigate("/");
    }
  }, [role]);

  useEffect(() => {
    fetchQ();
    fetchC();
  }, []);

  const handleClickAddQuestion = () => {
    onOpenQuestion();
  }

  const handleClickAddCompetency = () => {
    onOpenCompetency();
  }

  const onSortEndQuestion = ({oldIndex, newIndex}: {oldIndex: number, newIndex: number}) => {
    setRoom({...room, questions: arrayMove(room.questions, oldIndex, newIndex)});
  }

  const onSortEndCompetency = ({oldIndex, newIndex}: {oldIndex: number, newIndex: number}) => {
    setRoom({...room, competencies: arrayMove(room.competencies, oldIndex, newIndex)});
  }

  const handleDeleteQuestion = (idx: number) => {
    const newRoom = { ...room };
    newRoom.questions.splice(idx, 1);
    setRoom(newRoom);
  }

  const handleDeleteCompetency = (idx: number) => {
    const newRoom = { ...room };
    newRoom.competencies.splice(idx, 1);
    setRoom(newRoom);
  }

  const handleSubmit = async () => {
    try {
      setIsSubmit(true);
      const questionsId = [];
      for (var q of room.questions) {
        questionsId.push(q.id);
      }

      const competenciesId = [];
      for (var c of room.competencies) {
        competenciesId.push(c.id);
      }

      await createRoom(apiContext.axios, room.title, room.description, room.start, room.end, room.interview_email, questionsId, competenciesId);

      navigate("/")
    } catch(e) {
      if (e instanceof ApiError) {
        ToastModal(toast, "Error!", e.message, "error");
      } else {
        ToastModal(toast, "Error!", "Terjadi kesalahan pada sistem", "error");
      }
    }
  }

  return (
    <Layout>
      <CompetenciesListModal
        isOpen={isOpenCompetency}
        onClose={onCloseCompetency}
        handleSubmit={handleSubmit}
        title="Pilih Kompetensi"
        competencyCollections={competencyCollections}
        questionCollections={questionCollections}
        room={room}
        setRoom={setRoom}
      />
      <QuestionsListModal
        isOpen={isOpenQuestion}
        onClose={onCloseQuestion}
        handleSubmit={handleSubmit}
        title="Pilih Pertanyaan"
        questionCollections={questionCollections}
        competencyCollections={competencyCollections}
        room={room}
        setRoom={setRoom}
      />
      <Text as="h1" fontSize="2xl" fontWeight="semibold">Buat Ruangan Interview</Text>
      <Box as="form" onSubmit={(e: { preventDefault: () => void; }) => {
        e.preventDefault();
        handleSubmit();
      }}>
        <Text mt="3" as="h2" fontSize="lg" fontWeight="semibold">Informasi Umum</Text>
        <Box bg="white" rounded="md" p="3">
          <FormControl isInvalid={isSubmit && room.title === ""} mb="4">
            <FormLabel>Judul</FormLabel>
            <Input value={room.title} onChange={e => setRoom({...room, title: e.target.value})} placeholder="Judul Ruangan" mt="-2"/>
          </FormControl>
          <FormControl isInvalid={isSubmit && room.description === ""} mb="4">
            <FormLabel>Deskripsi</FormLabel>
            <Textarea value={room.description} onChange={e => setRoom({...room, description: e.target.value})} placeholder="Deskripsi Ruangan" mt="-2"/>
          </FormControl>
          <FormControl isInvalid={isSubmit && room.start === ""} mb="4">
            <FormLabel>Waktu Mulai</FormLabel>
            <Input type="datetime-local" value={room.start} onChange={e => setRoom({...room, start: e.target.value})} placeholder="Waktu Mulai" />
          </FormControl>
          <FormControl isInvalid={isSubmit && room.end === ""} mb="4">
            <FormLabel>Waktu Selesai</FormLabel>
            <Input type="datetime-local" value={room.end} onChange={e => setRoom({...room, end: e.target.value})} placeholder="Waktu Selesai" />
          </FormControl>
          <FormControl isInvalid={isSubmit && room.interview_email === ""} mb="4">
            <FormLabel>Email Kandidat</FormLabel>
            <Input value={room.interview_email} onChange={e => setRoom({...room, interview_email: e.target.value})} placeholder="Email Kandidat" mt="-2"/>
          </FormControl>
        </Box>
        {/* ************************************* */}
        <Text mt="3" as="h2" fontSize="lg" fontWeight="semibold">Kompetensi yang dinilai</Text>
        <TableContainer bg="white" rounded="md">
          <Flex justifyContent="space-between" p="5">
            <IconButton size="sm" aria-label="Add" bg="main_blue" color="white" icon={<AddIcon />} onClick={handleClickAddCompetency} />
          </Flex>
          <Table variant="simple" colorScheme="blue">
          <Thead>
            <Tr>
              <Th textTransform="capitalize" w="5%"></Th>
              <Th textTransform="capitalize" w="20%">Kompetensi</Th>
              <Th textTransform="capitalize" textAlign="center" w="60%">Deskripsi</Th>
              <Th textTransform="capitalize" textAlign="center" w="10%">Level</Th>
              <Th textTransform="capitalize" textAlign="center">Aksi</Th>
            </Tr>
          </Thead>
            <SortableTableCompetency
              items={room.competencies}
              onSortEnd={onSortEndCompetency}
              handleDeleteCompetency={handleDeleteCompetency}
            />
          </Table>
        </TableContainer>
        {/* ****************************************** */}
        <Text mt="3" as="h2" fontSize="lg" fontWeight="semibold">Pertanyaan</Text>
        <TableContainer bg="white" rounded="md">
          <Flex justifyContent="space-between" p="5">
            <IconButton size="sm" aria-label="Add" bg="main_blue" color="white" icon={<AddIcon />} onClick={handleClickAddQuestion} />
          </Flex>
          <Table variant="simple" colorScheme="blue">
            <Thead>
              <Tr>
                <Th w="5%"></Th>
                <Th textTransform="capitalize" w="40%">Pertanyaan</Th>
                <Th textTransform="capitalize" textAlign="center">Batas Durasi</Th>
                <Th textTransform="capitalize" w="30%" textAlign="center">Label</Th>
                <Th textTransform="capitalize" textAlign="center">Aksi</Th>
              </Tr>
            </Thead>
              <SortableTableQuestion
                items={room.questions}
                onSortEnd={onSortEndQuestion}
                handleDeleteQuestion={handleDeleteQuestion}
                competencyCollections={competencyCollections}
              />
          </Table>
        </TableContainer>
        <Button bg="main_blue" color="white" type="submit" mt="4">Kirim</Button>
      </Box>
    </Layout>
  )
}

export default Detail;