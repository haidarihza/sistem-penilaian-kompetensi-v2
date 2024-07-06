import { useContext, useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { ApiContext } from "../../utils/context/api";
import { AuthContext } from "../../utils/context/auth";
import { arrayMove } from 'react-sortable-hoc';
import { useNavigate, useLocation } from "react-router-dom";
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
  useToast,
  Select,
 } from "@chakra-ui/react";
 import {
  AutoComplete,
  AutoCompleteInput,
  AutoCompleteItem,
  AutoCompleteList,
  AutoCompleteTag,
} from "@choc-ui/chakra-autocomplete";
import { createRoom, createRoomGroup } from "../../api/room";
import { ApiError } from "../../interface/api";
import { Question } from "../../interface/question";
import { Competency } from "../../interface/competency";
import { RoomGroupCreate, RoomCreate } from "../../interface/room";
import { UserEmail } from "../../interface/auth";
import { AddIcon } from "@chakra-ui/icons";
import { getAllQuestion } from "../../api/question";
import { getAllCompetency } from "../../api/competency";
import { getAllEmails } from "../../api/auth"; 
import ToastModal from "../../components/ToastModal";
import CompetenciesListModal from "./CompetenciesListModal";
import QuestionsListModal from "./QuestionsListModal";
import SortableTableCompetency from "./SortableTableCompetency";
import SortableTableQuestion from "./SortableTableQuestion";
import DetailsCompetencyModal from "../competency/DetailsCompetencyModal";

const orgPosition: Array<string> = [
  "Direksi",
  "Manajerial",
  "Divisi IT",
  "Divisi HR",
  "Divisi Keuangan",
  "Divisi Pemasaran",
  "Divisi Produksi"
];

const Create = () => {
  const apiContext = useContext(ApiContext);
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();
  const toast = useToast();
  const location = useLocation();

  const { dataRoomGroup } = location.state as { dataRoomGroup: RoomGroupCreate } || {}

  const [room, setRoom] = useState<RoomCreate>({
    id: "",
    title: "",
    description: "",
    start: "",
    end: "",
    interviewer_email: "",
    questions_id: [] as string[],
    competencies_id: [] as string[],
    questions: [] as Question[],
    competencies: [] as Competency[]
  });

  const [roomGroup, setRoomGroup] = useState<RoomGroupCreate>({
    id: dataRoomGroup?.id || "",
    title: dataRoomGroup?.title || "",
    org_position: dataRoomGroup?.org_position || "",
    interviewee_email: dataRoomGroup?.interviewee_email || [],
    room: room
  });

  const [isSubmit, setIsSubmit] = useState(false);
  const { isOpen:isOpenQuestion, onOpen:onOpenQuestion, onClose:onCloseQuestion } = useDisclosure();
  const { isOpen:isOpenCompetency, onOpen:onOpenCompetency, onClose:onCloseCompetency } = useDisclosure();
  const { isOpen:isOpenDetailsCompetency, onOpen:onOpenDetailsCompetency, onClose:onCloseDetailsCompetency } = useDisclosure();

  const [questionCollections, setQuestionCollections] = useState<Array<Question>>([]);
  const [competencyCollections, setCompetencyCollections] = useState<Array<Competency>>([]);
  const [interviewerEmails, setInterviewerEmails] = useState<Array<UserEmail>>([]);
  const [intervieweeEmails, setIntervieweeEmails] = useState<Array<UserEmail>>([]);
  const [filteredIntervieweeEmails, setFilteredIntervieweeEmails] = useState<Array<UserEmail>>([]);
  const [selectedCompetency, setSelectedCompetency] = useState<Competency>({} as Competency);

  const role = authContext.auth?.role!;
  
  useEffect(() => {
    if (role !== "INTERVIEWER") {
      navigate("/");
    }
  }, [role, navigate]);

  useEffect(() => {
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
        const emails = await getAllEmails(apiContext.axios);
        setIntervieweeEmails(emails.filter((email) => email.role === "INTERVIEWEE"));
        setInterviewerEmails(emails.filter((email) => email.role === "INTERVIEWER"));
        setFilteredIntervieweeEmails(emails.filter((email) => email.role === "INTERVIEWEE"));
      } catch(e) {
        if (e instanceof ApiError) {
          ToastModal(toast, "Error!", e.message, "error");
        } else {
          ToastModal(toast, "Error!", "Terjadi kesalahan pada sistem", "error");
        }
      }
    }

    fetchQ();
    fetchC();
    fetchEmails();
  }, [apiContext.axios, toast]);

  useEffect(() => {
    const handleFilterEmail = () => {
      setFilteredIntervieweeEmails(intervieweeEmails.filter((email) => !roomGroup.interviewee_email.includes(email.email)));
    }  
    handleFilterEmail();
  }, [roomGroup.interviewee_email, intervieweeEmails]);

  const handleClickAddQuestion = () => {
    onOpenQuestion();
  }

  const handleClickAddCompetency = () => {
    onOpenCompetency();
  }

  const onSortEndQuestion = ({oldIndex, newIndex}: {oldIndex: number, newIndex: number}) => {
    setRoomGroup({...roomGroup, room: {...roomGroup.room, questions: arrayMove(roomGroup.room.questions, oldIndex, newIndex)}});
  }

  const onSortEndCompetency = ({oldIndex, newIndex}: {oldIndex: number, newIndex: number}) => {
    setRoomGroup({...roomGroup, room: {...roomGroup.room, competencies: arrayMove(roomGroup.room.competencies, oldIndex, newIndex)}});
  }

  const handleDeleteQuestion = (idx: number) => {
    const newRoom = { ...roomGroup.room };
    newRoom.questions.splice(idx, 1);
    setRoomGroup({...roomGroup, room: newRoom});
  }

  const handleDeleteCompetency = (idx: number) => {
    const newRoom = { ...roomGroup.room };
    newRoom.competencies.splice(idx, 1);
    setRoomGroup({...roomGroup, room: newRoom});
  }

  const roomCheck = (room: RoomCreate) => {
    if (room.title === "" || room.description === "" || room.start === "" || room.end === "" ||
        room.interviewer_email === "" || room.questions.length === 0 || room.competencies.length === 0) {
      return false;
    }
    return true;
  }

  const roomGroupCheck = (roomGroup: RoomGroupCreate) => {
    if (roomGroup.title === "" || roomGroup.org_position === "" || roomGroup.interviewee_email.length === 0) {
      return false;
    }
    return roomCheck(roomGroup.room);
  }

  const handledSeletectedCompetency = (competency: Competency) => {
    setSelectedCompetency(competency);
    onOpenDetailsCompetency();
  }

  const handleSubmit = async () => {
    try {
      setIsSubmit(true);
      if (!roomGroupCheck(roomGroup)) {
        ToastModal(toast, "Error!", "Semua kolom harus diisi", "error");
        return;
      }

      if (roomGroup.id !== "") {
        await createRoom(apiContext.axios, roomGroup.room, roomGroup.id, roomGroup.interviewee_email[0]);
        ToastModal(toast, "Success!", "Ruangan interview berhasil dibuat", "success");
        navigate("/");
        return;
      }

      await createRoomGroup(apiContext.axios, roomGroup.title, roomGroup.org_position, roomGroup.interviewee_email, roomGroup.room);
      ToastModal(toast, "Success!", "Ruangan interview berhasil dibuat", "success");
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
        roomGroup={roomGroup}
        setRoomGroup={setRoomGroup}
      />
      <QuestionsListModal
        isOpen={isOpenQuestion}
        onClose={onCloseQuestion}
        handleSubmit={handleSubmit}
        title="Pilih Pertanyaan"
        questionCollections={questionCollections}
        competencyCollections={competencyCollections}
        roomGroup={roomGroup}
        setRoomGroup={setRoomGroup}
      />
      <DetailsCompetencyModal
        isOpen={isOpenDetailsCompetency}
        onClose={onCloseDetailsCompetency}
        competency={selectedCompetency}
        handleSubmit={async () => {}}
      />
      <Text as="h1" fontSize="2xl" fontWeight="semibold">Buat Ruangan Interview</Text>
      <Box as="form" onSubmit={(e: { preventDefault: () => void; }) => {
        e.preventDefault();
        handleSubmit();
      }}>
        <Text mt="3" as="h2" fontSize="lg" fontWeight="semibold">Informasi Ruangan</Text>
        <Box bg="white" rounded="md" p="3">
          <FormControl isInvalid={isSubmit && roomGroup.title === ""} mb="4">
            <FormLabel>Judul Ruangan</FormLabel>
            <Input value={roomGroup.title} onChange={e => setRoomGroup({...roomGroup, title: e.target.value})} placeholder="Judul Ruangan" isDisabled={roomGroup.id !== ""}/>
            <FormErrorMessage>Judul ruangan harus diisi</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={isSubmit && roomGroup.interviewee_email.length === 0} mb="4">
            <FormLabel>Email Kandidat</FormLabel>
            <AutoComplete
              multiple
              openOnFocus
              defaultValues={roomGroup.interviewee_email}
              onChange={vals => setRoomGroup({...roomGroup, interviewee_email: vals})}
            >
              <AutoCompleteInput
                isDisabled={roomGroup.id !== ""}
                placeholder="Email Kandidat"
                hidePlaceholder={true}>
                {({ tags }) =>
                tags.map((tag, tid) => (
                  <AutoCompleteTag
                    key={tid}
                    label={tag.label}
                    onRemove={() => {
                      if (roomGroup.id === "") {
                        tag.onRemove();
                      }
                    }}
                    bg="main_blue"
                    color="white"
                  />
                ))
              }
              </AutoCompleteInput>
              <AutoCompleteList>
                {filteredIntervieweeEmails.map((val) => (
                  <AutoCompleteItem key={val.email} value={val.email} _focus={{ bg: "main_blue", color: "white" }}> 
                    {val.email}
                  </AutoCompleteItem>
                ))}
              </AutoCompleteList>
            </AutoComplete>
            <FormErrorMessage>Email Kandidat harus diisi</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={isSubmit && roomGroup.org_position === ""} mb="4">
            <FormLabel>Posisi Organisasi</FormLabel>
              <Select placeholder="Pilih Posisi Organisasi" value={roomGroup.org_position} onChange={(e) => setRoomGroup({ ...roomGroup, org_position: e.target.value })} isDisabled={roomGroup.id !== ""}>
                {orgPosition.map((val, i) => (
                <option key={i} value={val}>{val}</option>
                ))}
              </Select>
            <FormErrorMessage>Posisi Organisasi harus diisi</FormErrorMessage>
          </FormControl>
        </Box>
        {/* ************************************* */}
        <Text mt="3" as="h2" fontSize="lg" fontWeight="semibold">Informasi Interview</Text>
        <Box bg="white" rounded="md" p="3">
          <FormControl isInvalid={isSubmit && roomGroup.room.title === ""} mb="4">
            <FormLabel>Judul Interview</FormLabel>
            <Input value={roomGroup.room.title} onChange={e => setRoomGroup({...roomGroup, room: {...roomGroup.room, title: e.target.value}})} placeholder="Nama Interview" />
            <FormErrorMessage>Judul ruangan harus diisi</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={isSubmit && roomGroup.room.description === ""} mb="4">
            <FormLabel>Deskripsi</FormLabel>
            <Textarea value={roomGroup.room.description} onChange={e => setRoomGroup({...roomGroup, room: {...roomGroup.room, description: e.target.value}})} placeholder="Deskripsi Interview" />
            <FormErrorMessage>Deskripsi harus diisi</FormErrorMessage>
          </FormControl>
          <Box display="flex" flexDir="row" justifyContent="space-between">
            <FormControl isInvalid={isSubmit && roomGroup.room.start === ""} mb="4" pr="10">
              <FormLabel>Waktu Mulai</FormLabel>
              <Input type="datetime-local" value={roomGroup.room.start} onChange={e => setRoomGroup({...roomGroup, room: {...roomGroup.room, start: e.target.value}})} placeholder="Waktu Mulai" />
              <FormErrorMessage>Waktu Mulai harus diisi</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={isSubmit && roomGroup.room.end === ""} mb="4" pl="10">
              <FormLabel>Waktu Selesai</FormLabel>
              <Input type="datetime-local" value={roomGroup.room.end} onChange={e => setRoomGroup({...roomGroup, room: {...roomGroup.room, end: e.target.value}})} placeholder="Waktu Selesai" />
              <FormErrorMessage>Waktu Selesai harus diisi</FormErrorMessage>
            </FormControl>
          </Box>
          <FormControl isInvalid={isSubmit && roomGroup.room.interviewer_email === ""} mb="4">
            <FormLabel>Interviewer</FormLabel>
            <Select placeholder="Pilih Interviewer" value={roomGroup.room.interviewer_email} onChange={(e) => setRoomGroup({ ...roomGroup, room: { ...roomGroup.room, interviewer_email: e.target.value } })}>
              {interviewerEmails.map((val, i) => (
                <option key={i} value={val.email}>{val.name}</option>
              ))}
            </Select>
            <FormErrorMessage>Nama interviewer harus diisi</FormErrorMessage>
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
              <Th textTransform="capitalize" textAlign="center" w="50%">Deskripsi</Th>
              <Th textTransform="capitalize" textAlign="center">Aksi</Th>
            </Tr>
          </Thead>
            <SortableTableCompetency
              items={roomGroup.room.competencies}
              onSortEnd={onSortEndCompetency}
              handleDeleteCompetency={handleDeleteCompetency}
              handleSelectedCompetency={handledSeletectedCompetency}
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
                <Th textTransform="capitalize" textAlign="center">Durasi</Th>
                <Th textTransform="capitalize" textAlign="center">Posisi Organisasi</Th>
                <Th textTransform="capitalize" w="30%" textAlign="center">Kategori Kompetensi</Th>
                <Th textTransform="capitalize" textAlign="center">Aksi</Th>
              </Tr>
            </Thead>
              <SortableTableQuestion
                items={roomGroup.room.questions}
                competencies={roomGroup.room.competencies}
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

export default Create;