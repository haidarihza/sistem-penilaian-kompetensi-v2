import { useContext, useEffect, useState, useRef } from "react";
import { ApiContext } from "../../utils/context/api";
import { deleteRoom, getOneRoom, reviewRoom } from "../../api/room";
import { RoomDetail, RoomGroup } from "../../interface/room";
import { ApiError } from "../../interface/api";
import { 
  Box, 
  Text,
  Button,
  useDisclosure,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Spinner,
  FormControl,
  FormLabel,
  Textarea, 
  Heading,
  Stack,
  Icon,
  Divider,
  useToast,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  HStack,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";
import { Question } from "../../interface/question";
import { AuthContext } from "../../utils/context/auth";
import { CalendarIcon, DeleteIcon, TriangleDownIcon } from "@chakra-ui/icons";
import { MdAccessTimeFilled } from "react-icons/md";
import InterviewModal from "./InterviewModal";
import DetailsCompetencyModal from "../competency/DetailsCompetencyModal";
import DetailQuestionModal from "./DetailQuestionModal";
import { Competency, CompetencyLevel } from "../../interface/competency";
import ToastModal from "../../components/ToastModal";
import { languageOptions } from "../../utils/utils";

interface Props {
  roomGroup: RoomGroup;
  room_id: string;
  updateRoomGroup: () => void;
}

const Detail = ({
  roomGroup,
  room_id,
  updateRoomGroup
} : Props ) => {
  const apiContext = useContext(ApiContext);
  const authContext = useContext(AuthContext);
  const toast = useToast();
  const colors = [{
    status: "WAITING ANSWER",
    color: "main_beige"
  }, {
    status: "WAITING REVIEW",
    color: "#E6F4F1"
  }, {
    status: "REJECTED",
    color: "#8CBCFF"
  }, {
    status: "ACCEPTED",
    color: "#8CBCFF"
  }];

  const [data, setData] = useState<RoomDetail>({} as RoomDetail);
  const [note, setNote] = useState<string>("");

  const [question, setQuestion] = useState<string>("");
  const [transcript, setTranscript] = useState<string>("");

  const role = authContext.auth?.role!;

  const { isOpen:isOpenDetailQuestion, onOpen:onOpenDetailQuestion, onClose:onCloseDetailQuestion } = useDisclosure();
  const { isOpen:isOpenDetailCompetency, onOpen:onOpenDetailCompetency, onClose:onCloseDetailCompetency } = useDisclosure();
  const [selectedCompetency, setSelectedCompetency] = useState<Competency>({} as Competency);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isOpenDelete, onOpen: onOpenDelete, onClose: onCloseDelete } = useDisclosure();
  const cancelRef = useRef(null);

  const fetch = async () => {
    try {
      const rooms = await getOneRoom(apiContext.axios, room_id!);
      setData(rooms);
    } catch(e) {
      if (e instanceof ApiError) {
        ToastModal(toast, "Error!", e.message, "error");
      } else {
        ToastModal(toast, "Error!", "Terjadi kesalahan", "error");
      }
    }
  }

  useEffect(() => {
    fetch();
  }, []);

  const handleDetailQuestion = (idx: number) => {
    var tct = "";
    if (data.questions[idx].transcript) {
      tct = data.questions[idx].transcript!;
    }
    
    setQuestion(data.questions[idx].question);
    setTranscript(tct);
    onOpenDetailQuestion();
  }

  const handleDetailCompetency = (id: string) => {
    const competency = data.competencies?.find((val) => val.id === id);
    setSelectedCompetency(competency!);
    onOpenDetailCompetency();
  }

  const submitReview = async (status: string) => {
    try {
      await reviewRoom(apiContext.axios, room_id, status, note);
      fetch();
    } catch(e) {
      if (e instanceof ApiError) {
        ToastModal(toast, "Error!", e.message, "error");
      } else {
        ToastModal(toast, "Error!", "Terjadi kesalahan", "error");
      }
    }
  }

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const checkValidDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const currentDate = new Date();
    return startDate < currentDate && currentDate < endDate;
  }

  const countTotalTime = (questions: Question[]) => {
    let total = 0;
    questions?.forEach((val) => {
      total += val.duration_limit;
    });
    return total;
  }

  const getBestLevel = (levels: CompetencyLevel[]) => {
    let max = 0;
    let best = "";
    levels.forEach((val) => {
      if (parseFloat(val.result!) > max) {
        max = parseFloat(val.result!);
        best = val.level;
      }
    });
    return best;
  }

  const handleDeleteConfirm = (id: string) => {
    onOpenDelete();
  }

  const handleDeleteRoom = async () => {
    try {
      await deleteRoom(apiContext.axios, room_id);
      ToastModal(toast, "Success!", "Room Deleted", "success");
      updateRoomGroup();
    } catch(e) {
      if (e instanceof ApiError) {
        ToastModal(toast, "Error!", e.message, "error");
      } else {
        ToastModal(toast, "Error!", "Something Went Wrong", "error");
      }
    } finally {
      onCloseDelete();
    }
  }

  return (
    <Box>
      <DetailQuestionModal
        isOpen={isOpenDetailQuestion}
        onClose={onCloseDetailQuestion}
        question={question}
        transcript={transcript}
      />
      <DetailsCompetencyModal
        isOpen={isOpenDetailCompetency}
        onClose={onCloseDetailCompetency}
        competency={selectedCompetency}
        handleSubmit={async () => {}}
      />
      {role === "INTERVIEWER" ? (
        <Box bg="white" rounded="md" p="3">
          <Box mb="6" mt="2" display="flex" alignItems="center" justifyContent="space-between">
            <Menu placement="bottom-start">
              <MenuButton 
                as={Button} 
                colorScheme="whiteAlpha"
                color="main_blue"
                _hover={{ bg: "gray.100", color: "main_blue" }}
                rightIcon={<TriangleDownIcon w="3" />}
                pl="0"
              >
                <HStack>
                  <Text fontWeight="bold" fontSize="xl">{data.title}</Text>
                </HStack>
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => handleDeleteConfirm(room_id)} color="main_blue">
                  <IconButton
                    aria-label="Delete"
                    icon={<DeleteIcon />}
                    colorScheme='white.400'
                    color="main_blue"
                    size="sm"/>
                  Delete
                </MenuItem>
              </MenuList>
            </Menu>
            <Box
              bg={colors.find((val) => val.status === data.status)?.color}
              color="main_blue"
              rounded="md">
              <Text fontSize="lg" p="2" fontWeight="extrabold">{data.status}</Text>
            </Box>
          </Box>
          <Text as="h3" fontSize="md" mb="6">{data.description}</Text>
          <Box display="flex" flexDir="row" mb="4" flexWrap="wrap" alignItems="flex-start">
            <Box display="flex" flexDir="column" w="50%" mb="10" p="2">
              <Box bg="main_blue" color="white" p="1" rounded="md" w="fit-content" mb="4">
                <Text fontWeight="bold">Informasi Umum</Text>
              </Box>
              <Text mb="2"><b>Tanggal Wawancara :</b> {formatDateTime(data.start)} - {formatDateTime(data.end)}</Text>
              <Text mb="2"><b>Submission :</b> {data.submission === "-" ? "-" : formatDateTime(data.submission)}</Text>
              <Text mb="2"><b>Waktu Total :</b> ~ {countTotalTime(data.questions)} menit</Text>
              <Text mb="2"><b>Posisi Organisasi :</b> {roomGroup.org_position}</Text>
              <Text mb="2"><b>Interviewer :</b> {data.interviewer_name}</Text>
              <Text mb="2"><b>Bahasa :</b> {languageOptions.find((val) => val.value === data.language)?.label}</Text>
            </Box>
            <Box display="flex" flexDir="column" w="50%" mb="10" p="2">
              <Box bg="main_blue" color="white" p="1" rounded="md" w="fit-content" mb="4">
                <Text fontWeight="bold">Informasi Kandidat</Text>
              </Box>
              <Text mb="2"><b>Nama :</b> {roomGroup.interviewee_name}</Text>
              <Text mb="2"><b>Email :</b> {roomGroup.interviewee_email}</Text>
              <Text mb="2"><b>Phone :</b> {roomGroup.interviewee_phone}</Text>
            </Box>
            <Box display="flex" flexDir="column" w="50%" mb="10" p="2">
              <Box bg="main_blue" color="white" p="1" rounded="md" w="fit-content" mb="4">
                <Text fontWeight="bold">Pertanyaan</Text>
              </Box>
              <TableContainer bg="white" rounded="md" w="100%">
                  <Table variant="simple" size="sm" w="100%" colorScheme="blue">
                    <Thead>
                      <Tr>
                        <Th textTransform="capitalize" w="30%">Pertanyaan</Th>
                        <Th textTransform="capitalize" textAlign="center" w="10%">Batas Durasi</Th>
                        <Th textTransform="capitalize" textAlign="center" w="10%">Aksi</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {data.questions ? data.questions.map((val, idx) => (
                        <Tr key={idx}>
                          <Td w="30%" overflow="hidden" textOverflow="ellipsis" whiteSpace="normal">{val.question}</Td>
                          <Td w="10%" textAlign="center">{val.duration_limit} menit</Td>
                          <Td w="10%" textAlign="center">
                          <Button size="sm" bg="main_blue" color="white" onClick={e => handleDetailQuestion(idx)}>Detail</Button>
                          </Td>
                        </Tr>
                      )) : <Spinner />}
                    </Tbody>
                  </Table>
                </TableContainer>
            </Box>
            <Box display="flex" flexDir="column" w="50%" mb="10" p="2">
              <Box bg="main_blue" color="white" p="1" rounded="md" w="fit-content" mb="4">
                <Text fontWeight="bold">Kompetensi</Text>
              </Box>
              <TableContainer bg="white" rounded="md" w="100%">
                <Table variant="simple" size="sm" w="100%" colorScheme="blue">
                  <Thead>
                    <Tr>
                      <Th textTransform="capitalize" w="30%">Kompetensi</Th>
                      <Th textTransform="capitalize" textAlign="center" w="10%">Aksi</Th>
                      <Th textTransform="capitalize" textAlign="center" w="10%">Hasil Penilaian</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {data.competencies ? data.competencies.map((val) => (
                      <Tr key={val.id}>
                        <Td w="30%">{val.competency}</Td>
                        <Td w="10%" textAlign="center">
                          <Button size="sm" bg="main_blue" color="white" onClick={e => handleDetailCompetency(val.id)}>Detail</Button>
                        </Td>
                        <Td w="10%" textAlign="center">
                          {getBestLevel(val.levels) === "" ? "Belum Ada Hasil" : getBestLevel(val.levels)}
                        </Td>
                      </Tr>
                    )) : <Spinner />}
                  </Tbody>
                </Table>
              </TableContainer>
            </Box>
          </Box>

          {data.status === "WAITING REVIEW" && (
            <Box display="flex" flexDir="column" w="50%" mb="10" p="2">
              <Box bg="main_blue" color="white" p="1" rounded="md" w="fit-content" mb="4">
                <Text fontWeight="bold">Review Kandidat</Text>
              </Box>
              <FormControl mb="4">
                <FormLabel>Note kandidat</FormLabel>
                <Textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Berikan note untuk kandidat" />
              </FormControl>
              <Box display="flex" flexDir="row" justifyContent="flex-start">
                <Button w="fit-content" mr="2" onClick={() => submitReview("REJECTED")}>Tolak</Button>
                <Button w="fit-content" bg="main_blue" color="white" onClick={() => submitReview("ACCEPTED")}>Terima</Button>
              </Box>
            </Box>
          )}
          {((data.status === "ACCEPTED") || (data.status === "REJECTED")) && (
            <Box>
             <Text as="h3" fontSize="sm">Note: {data.note}</Text>
           </Box>
          )}
        </Box>
      ) : (
        // INTERVIEWEE PART
        <Box bg="white" rounded="md" p="3">
          <Heading mb="6" mt="2" display="flex" alignItems="center" justifyContent="space-between">
            <Text fontWeight="bold" fontSize="2xl">{data.title}</Text>
            <Box 
              bg={colors.find((val) => val.status === data.status)?.color}
              color="main_blue"
              rounded="md">
              <Text fontSize="lg" p="2" fontWeight="extrabold">{data.status}</Text>
            </Box>
          </Heading>
          <Text as="h3" fontSize="md" mb="6">{data.description}</Text>
          <Divider mb="6"/>
          <Stack spacing="2">
              <Box display="flex" flexDir="row" alignItems="center" mb="4">
                <Icon color="main_blue" mr="4" boxSize="25px" as={CalendarIcon} />
                <Box display="flex" flexDir="column">
                  <Text fontSize="sm" fontWeight="normal">Start: {formatDateTime(data.start)}</Text>
                  <Text fontSize="sm" fontWeight="normal">End: {formatDateTime(data.end)}</Text>
                </Box>
              </Box>
              <Box display="flex" flexDir="row" alignItems="center" mb="4">
                <Icon color="main_blue" mr="4" boxSize="25px" as={MdAccessTimeFilled} />
                <Box display="flex" flexDir="column">
                  <Text fontSize="sm" fontWeight="normal">~ {countTotalTime(data.questions)} menit</Text>
                </Box>
              </Box>
          </Stack>
          {data.status === "WAITING REVIEW" && (
            <Box display="flex" alignItems="center" flexDir="column">
              <Text fontSize="xl" mt="5" fontWeight="semibold">
                Selamat Anda telah menyelesaikan interview!
              </Text>
              <Text fontSize="xl" fontWeight="semibold">
                Tunggu HR untuk mereview jawaban Anda.
              </Text>
            </Box>
          )}
          <Heading mt="6" fontSize="xl" fontWeight="bold" mb="4">Catatan</Heading>
          <Text fontSize="md">{data.note}</Text>
          {data.status === "WAITING ANSWER" && (
            <Box display="flex" flexDir="row" justifyContent="flex-end">
              <Button
                bg="main_blue"
                color="white"
                mt="5"
                onClick={onOpen}
                isDisabled={!checkValidDateRange(data.start, data.end)}
                >Mulai Wawancara</Button>
            </Box>
          )}
        </Box>
      )}
      <InterviewModal 
        isOpen={isOpen} 
        onClose={onClose} 
        questions={data.questions} 
        room={data}
        updateRoom={fetch}
      />
      <AlertDialog
        isOpen={isOpenDelete}
        leastDestructiveRef={cancelRef}
        onClose={onCloseDelete}
        isCentered={true}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Hapus Ruangan
            </AlertDialogHeader>

            <AlertDialogBody>
              Apakah Anda yakin ingin menghapus ruangan ini?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onCloseDelete}>
                Batal
              </Button>
              <Button colorScheme='red' onClick={() => handleDeleteRoom()} ml={3}>
                Hapus
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  )
}

export default Detail;