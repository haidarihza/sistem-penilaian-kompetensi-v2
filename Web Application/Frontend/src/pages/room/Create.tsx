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
  FormErrorMessage,
  FormLabel,
  IconButton,
  Input,
  Table,
  TableContainer,
  Text,
  Textarea,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast
 } from "@chakra-ui/react";
 import {
  AutoComplete,
  AutoCompleteInput,
  AutoCompleteItem,
  AutoCompleteList,
  AutoCompleteTag,
} from "@choc-ui/chakra-autocomplete";
import { createRoom } from "../../api/room";
import { ApiError } from "../../interface/api";
import { Question } from "../../interface/question";
import { Competency } from "../../interface/competency";
import { RoomCreate } from "../../interface/room";
import { AddIcon } from "@chakra-ui/icons";
import { getAllQuestion } from "../../api/question";
import { getAllCompetency } from "../../api/competency";
import { getAllEmailsInterviewee } from "../../api/auth"; 
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
    interview_email: [],
    questions: [] as Array<Question>,
    competencies: [] as Array<Competency>
  });

  const [isSubmit, setIsSubmit] = useState(false);
  const { isOpen:isOpenQuestion, onOpen:onOpenQuestion, onClose:onCloseQuestion } = useDisclosure();
  const { isOpen:isOpenCompetency, onOpen:onOpenCompetency, onClose:onCloseCompetency } = useDisclosure();

  const [questionCollections, setQuestionCollections] = useState<Array<Question>>([]);
  const [competencyCollections, setCompetencyCollections] = useState<Array<Competency>>([]);
  const [emailList, setEmailList] = useState<Array<string>>([]);
  const [filteredEmailList, setFilteredEmailList] = useState<Array<string>>([]);

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

  const fetchEmails = async () => {
    try {
      const emails = await getAllEmailsInterviewee(apiContext.axios);
      setEmailList(emails);
      setFilteredEmailList(emails);
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
    fetchEmails();
  }, []);

  useEffect(() => {
    handleFilterEmail();
  }, [room.interview_email]);

  const handleFilterEmail = () => {
    // set filteredemaillist that not containe email in room.interview_email
    setFilteredEmailList(emailList.filter((email) => !room.interview_email.includes(email)));
  }

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
      if (room.title === "" || room.description === "" || room.start === "" || room.end === "" ||
          room.interview_email.length === 0 || room.questions.length === 0 || room.competencies.length === 0) {
        ToastModal(toast, "Error!", "Semua kolom harus diisi", "error");
        return;
      }
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
            <FormErrorMessage>Judul harus diisi</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={isSubmit && room.description === ""} mb="4">
            <FormLabel>Deskripsi</FormLabel>
            <Textarea value={room.description} onChange={e => setRoom({...room, description: e.target.value})} placeholder="Deskripsi Ruangan" mt="-2"/>
            <FormErrorMessage>Deskripsi harus diisi</FormErrorMessage>
          </FormControl>
          <Box display="flex" flexDir="row" justifyContent="space-between">
            <FormControl isInvalid={isSubmit && room.start === ""} mb="4" pr="10">
              <FormLabel>Waktu Mulai</FormLabel>
              <Input type="datetime-local" value={room.start} onChange={e => setRoom({...room, start: e.target.value})} placeholder="Waktu Mulai" />
              <FormErrorMessage>Waktu Mulai harus diisi</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={isSubmit && room.end === ""} mb="4" pl="10">
              <FormLabel>Waktu Selesai</FormLabel>
              <Input type="datetime-local" value={room.end} onChange={e => setRoom({...room, end: e.target.value})} placeholder="Waktu Selesai" />
              <FormErrorMessage>Waktu Selesai harus diisi</FormErrorMessage>
            </FormControl>
          </Box>
          <FormControl isInvalid={isSubmit && room.interview_email.length === 0} mb="4">
            <FormLabel>Email Kandidat</FormLabel>
            <AutoComplete
              multiple
              openOnFocus
              onChange={vals => setRoom({...room, interview_email: vals})}
            >
              <AutoCompleteInput
                placeholder="Email Kandidat"
                hidePlaceholder={true}>
                {({ tags }) =>
                tags.map((tag, tid) => (
                  <AutoCompleteTag
                    key={tid}
                    label={tag.label}
                    onRemove={tag.onRemove}
                    bg="main_blue"
                    color="white"
                  />
                ))
              }
              </AutoCompleteInput>
              <AutoCompleteList>
                {filteredEmailList.map((val) => (
                  <AutoCompleteItem key={val} value={val} _focus={{ bg: "main_blue", color: "white" }}> 
                    {val}
                  </AutoCompleteItem>
                ))}
              </AutoCompleteList>
            </AutoComplete>
            <FormErrorMessage>Email Kandidat harus diisi</FormErrorMessage>
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