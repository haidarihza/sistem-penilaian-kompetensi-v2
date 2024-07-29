import { useContext, useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { ApiContext } from "../../utils/context/api";
import { AuthContext } from "../../utils/context/auth";
import { arrayMove } from 'react-sortable-hoc';
import { useNavigate, useLocation, useParams } from "react-router-dom";
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
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper
 } from "@chakra-ui/react";
 import {
  AutoComplete,
  AutoCompleteInput,
  AutoCompleteItem,
  AutoCompleteList,
  AutoCompleteTag,
} from "@choc-ui/chakra-autocomplete";
import { createRoom, createRoomGroup, getOneRoom, getOneRoomGroup, updateQuestionsCompetencies } from "../../api/room";
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
import { orgPosition, languageOptions } from "../../utils/utils";

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const CreateRoom = () => {
  const apiContext = useContext(ApiContext);
  const authContext = useContext(AuthContext);
  const params = useParams();
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
    language: "",
    preparation_time: 0,
    questions_id: [] as string[],
    competencies_id: [] as string[],
    questions: [] as Question[],
    competencies: [] as Competency[]
  });

  const [roomGroup, setRoomGroup] = useState<RoomGroupCreate>({
    title: dataRoomGroup?.title || "",
    id: dataRoomGroup?.id || "",
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
    if (!["INTERVIEWER", "HRD"].includes(role)) {
      navigate("/");
    }
  }, [role, navigate]);

  const fetchRoomAndRoomGroup = async () => {
    try {
      if (params.id) {
        const roomData = await getOneRoom(apiContext.axios, params.id);
        const roomGroupData = await getOneRoomGroup(apiContext.axios, roomData.room_group_id);
        const intervieweeEmail = roomGroupData.interviewee_email ? [roomGroupData.interviewee_email] : [];
        setRoomGroup({
          id: roomGroupData.id,
          title: roomGroupData.title,
          org_position: roomGroupData.org_position,
          interviewee_email: intervieweeEmail,
          room: {
            id: roomData.id,
            title: roomData.title,
            description: roomData.description,
            start: formatDateTime(roomData.start),
            end: formatDateTime(roomData.end),
            interviewer_email: roomData.interviewer_email,
            language: roomData.language,
            preparation_time: roomData.preparation_time,
            questions_id: [],
            competencies_id: [],
            questions: roomData.questions,
            competencies: roomData.competencies,          
          }
        });
      }
    } catch(e) {
      if (e instanceof ApiError) {
        ToastModal(toast, "Error!", e.message, "error");
      } else {
        ToastModal(toast, "Error!", "Terjadi kesalahan pada sistem", "error");
      }
    }
  }

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
    if (params.id) {
      fetchRoomAndRoomGroup();
    }
  }, [apiContext.axios, toast, params.id]);

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
    if (room.title === "" || room.description === "" || room.start === "" || room.end === "" || room.language === "" || room.preparation_time === 0 ||
        room.interviewer_email === "") {
      return false;
    }
    return true;
  }

  const roomGroupCheck = (roomGroup: RoomGroupCreate) => {
    if (roomGroup.org_position === "" || roomGroup.interviewee_email.length === 0) {
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

      if (params.id !== "") {
        await updateQuestionsCompetencies(apiContext.axios, roomGroup);
        ToastModal(toast, "Success!", "Ruangan interview berhasil diupdate", "success");
        navigate("/");
        return;
      }
      if (roomGroup.id !== "") {
        await createRoom(apiContext.axios, roomGroup.room, roomGroup.id, roomGroup.interviewee_email[0]);
        ToastModal(toast, "Success!", "Ruangan interview berhasil dibuat", "success");
        navigate("/");
        return;
      }

      await createRoomGroup(apiContext.axios, roomGroup.org_position, roomGroup.interviewee_email, roomGroup.room);
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
        <FormControl mb="4">
            <FormLabel>Nama Ruangan</FormLabel>
            <Input value={roomGroup.title} placeholder="Nama Ruangan Otomatis Dibuat oleh Sistem" isDisabled={true}/>
          </FormControl>
          <FormControl isInvalid={isSubmit && roomGroup.interviewee_email.length === 0} mb="4">
            <FormLabel>Email Kandidat</FormLabel>
            <AutoComplete
              multiple
              openOnFocus
              values={roomGroup.interviewee_email}
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
            <FormLabel>Lowongan Jabatan</FormLabel>
              <Select placeholder="Lowongan Jabatan" value={roomGroup.org_position} onChange={(e) => setRoomGroup({ ...roomGroup, org_position: e.target.value })} isDisabled={roomGroup.id !== ""}>
                {orgPosition.map((val, i) => (
                <option key={i} value={val}>{val}</option>
                ))}
              </Select>
            <FormErrorMessage>Lowongan Jabatan harus diisi</FormErrorMessage>
          </FormControl>
        </Box>
        {/* ************************************* */}
        <Text mt="3" as="h2" fontSize="lg" fontWeight="semibold">Informasi Interview</Text>
        <Box bg="white" rounded="md" p="3">
          <FormControl isInvalid={isSubmit && roomGroup.room.title === ""} mb="4">
            <FormLabel>Nama Interview</FormLabel>
            <Input value={roomGroup.room.title} onChange={e => setRoomGroup({...roomGroup, room: {...roomGroup.room, title: e.target.value}})} placeholder="Nama Interview" isDisabled={params.id !== ""}/>
            <FormErrorMessage>Judul ruangan harus diisi</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={isSubmit && roomGroup.room.description === ""} mb="4">
            <FormLabel>Deskripsi</FormLabel>
            <Textarea value={roomGroup.room.description} onChange={e => setRoomGroup({...roomGroup, room: {...roomGroup.room, description: e.target.value}})} placeholder="Deskripsi Interview" isDisabled={params.id !== ""}/>
            <FormErrorMessage>Deskripsi harus diisi</FormErrorMessage>
          </FormControl>
          <Box display="flex" flexDir="row" justifyContent="space-between">
            <FormControl isInvalid={isSubmit && roomGroup.room.start === ""} mb="4" pr="10">
              <FormLabel>Waktu Mulai</FormLabel>
              <Input type="datetime-local" value={roomGroup.room.start} onChange={e => setRoomGroup({...roomGroup, room: {...roomGroup.room, start: e.target.value}})} placeholder="Waktu Mulai" isDisabled={params.id !== ""}/>
              <FormErrorMessage>Waktu Mulai harus diisi</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={isSubmit && roomGroup.room.end === ""} mb="4" pl="10">
              <FormLabel>Waktu Selesai</FormLabel>
              <Input type="datetime-local" value={roomGroup.room.end} onChange={e => setRoomGroup({...roomGroup, room: {...roomGroup.room, end: e.target.value}})} placeholder="Waktu Selesai" isDisabled={params.id !== ""}/>
              <FormErrorMessage>Waktu Selesai harus diisi</FormErrorMessage>
            </FormControl>
          </Box>
          <FormControl isInvalid={isSubmit && roomGroup.room.interviewer_email === ""} mb="4">
            <FormLabel>Interviewer</FormLabel>
            <Select placeholder="Pilih Interviewer" value={roomGroup.room.interviewer_email} onChange={(e) => setRoomGroup({ ...roomGroup, room: { ...roomGroup.room, interviewer_email: e.target.value } })} isDisabled={params.id !== ""}>
              {interviewerEmails.map((val, i) => (
                <option key={i} value={val.email}>{val.name}</option>
              ))}
            </Select>
            <FormErrorMessage>Nama interviewer harus diisi</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={isSubmit && roomGroup.room.language === ""} mb="4">
            <FormLabel>Bahasa</FormLabel>
            <Select placeholder="Pilih Bahasa" value={roomGroup.room.language} onChange={(e) => setRoomGroup({ ...roomGroup, room: { ...roomGroup.room, language: e.target.value } })} isDisabled={params.id !== ""}>
              {languageOptions.map((val, i) => (
                <option key={i} value={val.value}>{val.label}</option>
              ))}
            </Select>
            <FormErrorMessage>Bahasa harus diisi</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={isSubmit && roomGroup.room.preparation_time === 0} mb="4">
            <FormLabel>Waktu Persiapan (detik)</FormLabel>
              <NumberInput value={roomGroup.room.preparation_time} onChange={(valueAsString: string, valueAsNumber: number) => setRoomGroup({ ...roomGroup, room: { ...roomGroup.room, preparation_time: valueAsNumber } })} min={1} isDisabled={params.id !== ""}>
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            <FormErrorMessage>Waktu Persiapan harus diisi</FormErrorMessage>
          </FormControl>
        </Box>
        {/* ************************************* */}
        {role === "INTERVIEWER" ? (
          <>
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
                  <Th textTransform="capitalize" textAlign="center">Lowongan Jabatan</Th>
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
          </>
        ) : ( <></> )}
        <Button bg="main_blue" color="white" type="submit" mt="4">{params.id !== "" ? "Update Ruangan" : "Buat Ruangan"}</Button>
      </Box>
    </Layout>
  )
}

export default CreateRoom;