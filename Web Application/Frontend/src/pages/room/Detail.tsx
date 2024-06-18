import { useContext, useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { ApiContext } from "../../utils/context/api";
import { answerQuestion, getOneRoom, reviewRoom } from "../../api/room";
import { RoomDetail } from "../../interface/room";
import { ApiError } from "../../interface/api";
import Layout from "../../components/Layout";
import { 
  Box, 
  Text,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
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
} from "@chakra-ui/react";
import { Question } from "../../interface/question";
import Webcam from "react-webcam";
import { AuthContext } from "../../utils/context/auth";
import { CalendarIcon } from "@chakra-ui/icons";
import { MdAccessTimeFilled } from "react-icons/md";
import InterviewModal from "./InterviewModal";

const Detail = () => {
  const params = useParams();
  const apiContext = useContext(ApiContext);
  const authContext = useContext(AuthContext);
  const [data, setData] = useState<RoomDetail>({} as RoomDetail);
  const [note, setNote] = useState<string>("");

  const [question, setQuestion] = useState<string>("");
  const [transcript, setTranscript] = useState<string>("");

  const role = authContext.auth?.role!;

  const { isOpen:isOpenDetail, onOpen:onOpenDetail, onClose:onCloseDetail } = useDisclosure();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const fetch = async () => {
    try {
      const rooms = await getOneRoom(apiContext.axios, params.id!);
      setData(rooms);
    } catch(e) {
      if (e instanceof ApiError) {
        alert(e.message);
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
    onOpenDetail();
  }

  const submitReview = async (status: string) => {
    try {
      await reviewRoom(apiContext.axios, params.id!, status, note);
      fetch();
    } catch(e) {
      if (e instanceof ApiError) {
        alert(e.message);
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

  const countTotalTime = (questions: Question[]) => {
    let total = 0;
    questions?.forEach((val) => {
      total += val.duration_limit;
    });
    return total;
  }

  return (
    <Layout>
      <Modal isOpen={isOpenDetail} onClose={onCloseDetail} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Detail Pertanyaan</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text as="h1" fontWeight="semibold">Pertanyaan</Text>
            <Text>{question}</Text>
            <Text as="h1" fontWeight="semibold" mt="2">Transkrip Jawaban Kandidat</Text>
            <Text>{transcript !== "" ? transcript : "Belum Ada Hasil"}</Text>
          </ModalBody>
        </ModalContent>
      </Modal>
      {role === "INTERVIEWER" ? (
        <Box>
          <Text as="h2" fontSize="xl" fontWeight="semibold">Informasi Umum</Text>
          <Box bg="white" rounded="md" p="3" display="flex">
            <Box>
              <Text as="h3" fontSize="md">{data.description}</Text>
              <Text as="h3" fontSize="xl" fontWeight="semibold">Informasi Kandidat</Text>
              <Text>Nama: {data.interviewee_name}</Text>
              <Text>Email: {data.interviewee_email}</Text>
              <Text>Phone: {data.interviewee_phone}</Text>
            </Box>
            <Box>

            </Box>
          </Box>

          <Text as="h2" fontSize="xl" fontWeight="semibold" mt="5">Kompetensi</Text>
          <TableContainer bg="white" rounded="md">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th textTransform="capitalize" w="20%">Kompetensi</Th>
                  <Th textTransform="capitalize" w="70%">Level</Th>
                  <Th textTransform="capitalize" textAlign="center">Hasil</Th>
                </Tr>
              </Thead>
              <Tbody>
                {data.competencies ? data.competencies.map((val) => (
                  <Tr key={val.id}>
                    <Td>{val.competency}</Td>
                    <Td>
                      {val.levels.map((level) => (
                        <Text maxW="45rem" noOfLines={1} key={level.id}>{level.level}: {level.description}</Text>
                      ))}
                    </Td>
                    <Td isNumeric>
                      {val.levels.map((level) => <Text key={level.id}>{level.result? parseFloat(level.result).toFixed(3) : "Belum Ada Hasil"}</Text>)}
                    </Td>
                  </Tr>
                )) : <Spinner />}
              </Tbody>
            </Table>
          </TableContainer>

          <Text as="h2" fontSize="xl" fontWeight="semibold" mt="5">Pertanyaan</Text>
          <TableContainer bg="white" rounded="md">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th textTransform="capitalize" w="90%">Pertanyaan</Th>
                  <Th textTransform="capitalize" textAlign="center">Batas Durasi</Th>
                  <Th textTransform="capitalize" textAlign="center">Aksi</Th>
                </Tr>
              </Thead>
              <Tbody>
                {data.questions ? data.questions.map((val, idx) => (
                  <Tr key={idx}>
                    <Td>{val.question}</Td>
                    <Td textAlign="center">{val.duration_limit} menit</Td>
                    <Td>
                    <Button onClick={e => handleDetailQuestion(idx)}>Detail</Button>
                    </Td>
                  </Tr>
                )) : <Spinner />}
              </Tbody>
            </Table>
          </TableContainer>
          {data.status === "Menunggu Review" && (
            <Box>
              <Text as="h2" fontSize="xl" fontWeight="semibold" mt="5">Review Kandidat!</Text>
              <FormControl>
                <FormLabel>Note kandidat</FormLabel>
                <Textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Berikan note untuk kandidat" />
              </FormControl>
              <Button mr="2" onClick={() => submitReview("Ditolak")}>Tolak</Button>
              <Button bg="#4099f8" color="white" onClick={() => submitReview("Diterima")}>Terima</Button>
            </Box>
          )}
          {(data.status === "Diterima" || "Ditolak") && (
            <Box>
             <Text as="h2" fontSize="xl" fontWeight="semibold" mt="5">Status Kandidat</Text>
             <Text as="h3" fontSize="md">{data.status}</Text>
             <Text as="h3" fontSize="sm">Note: {data.note}</Text>
           </Box>
          )}
        </Box>
      ) : (
        // INTERVIEWEE PART
        <Box bg="white" rounded="md" p="3">
          <Heading mb="6" mt="2" display="flex" alignItems="center" justifyContent="space-between">
            <Text fontWeight="bold" fontSize="2xl">{data.title}</Text>
            <Box bg="main_beige" color="main_blue" rounded="md">
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
          <Heading mt="6" fontSize="xl" fontWeight="bold">Catatan</Heading>
          <Text fontSize="lg">{data.note}</Text>
          {data.status === "WAITING ANSWER" && (
            <Box display="flex" flexDir="row" justifyContent="flex-end">
              <Button bg="main_blue" color="white" mt="5" onClick={onOpen}>Mulai Wawancara</Button>
            </Box>
          )}
        </Box>
      )}
      <InterviewModal 
        isOpen={isOpen} 
        onClose={onClose} 
        questions={data.questions} 
        room={data}
      />
    </Layout>
  )
}

export default Detail;