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
  ModalFooter,
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
} from "@chakra-ui/react";
import { Question } from "../../interface/question";
import Webcam from "react-webcam";
import { AuthContext } from "../../utils/context/auth";

const Detail = () => {
  const params = useParams();
  const apiContext = useContext(ApiContext);
  const authContext = useContext(AuthContext);
  const [data, setData] = useState<RoomDetail>({} as RoomDetail);
  const [current, setCurrent] = useState<Question>({} as Question);
  const questionIdx = useRef<number>(0);
  const [timer, setTimer] = useState<number>(0);
  const [note, setNote] = useState<string>("");

  const [question, setQuestion] = useState<string>("");
  const [transcript, setTranscript] = useState<string>("");

  const role = authContext.auth?.role!;

  const { isOpen:isOpenDetail, onOpen:onOpenDetail, onClose:onCloseDetail } = useDisclosure();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const tick = () => {
    if (timer === 0) {
      handleStopCaptureClick();
    } else {
      setTimer(timer-1);
    }
  }

  const fetch = async () => {
    try {
      const rooms = await getOneRoom(apiContext.axios, params.id!);
      setData(rooms);
      setCurrent(rooms.questions[questionIdx.current]);
    } catch(e) {
      if (e instanceof ApiError) {
        alert(e.message);
      }
    }
  }

  useEffect(() => {
    const timerId = setInterval(() => tick(), 1000);
    return () => clearInterval(timerId);
  });

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

  const webcamRef = useRef<Webcam>({} as Webcam);
  const mediaRecorderRef = useRef<MediaRecorder>({} as MediaRecorder);
  const [capturing, setCapturing] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Array<BlobPart>>([] as Array<BlobPart>);

  const handleDataAvailable = useCallback(
    ({ data } : { data: Blob }) => {
      if (data.size > 0) {
        setRecordedChunks((prev) => prev.concat(data));
      }
    },
    [setRecordedChunks]
  );

  const handleStartCaptureClick = useCallback(() => {
    setCapturing(true);
    mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream!, {
      mimeType: "video/webm",
    });
    mediaRecorderRef.current.addEventListener(
      "dataavailable",
      handleDataAvailable
    );
    mediaRecorderRef.current.start();
  }, [webcamRef, setCapturing, mediaRecorderRef, handleDataAvailable]);

  const handleStopCaptureClick = useCallback(() => {
    mediaRecorderRef.current.stop();
    setCapturing(false);
  }, [mediaRecorderRef, setCapturing]);

  const handleSubmit = useCallback(() => {
    if (recordedChunks.length) {
      const blob = new Blob(recordedChunks, {
        type: "video/webm",
      });

      answer(blob);
      setRecordedChunks([]);
    }
  }, [recordedChunks]);

  const answer = async (value : Blob) => {
    try {
      await answerQuestion(apiContext.axios, data.id, data.questions[questionIdx.current-1].id, value);
    } catch(e) {
      if (e instanceof ApiError) {
        alert(e.message);
      }
    }
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

  const videoConstraints = {
    width: 1080,
    height: 540,
    facingMode: "user",
  };

  useEffect(() => {
    if (recordedChunks.length > 0 && !capturing) {
      questionIdx.current += 1
      if (questionIdx.current < data.questions.length) {
        setCurrent(data.questions[questionIdx.current]);
      }
      handleSubmit();
    }
  }, [recordedChunks])

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
      <Text as="h1" fontSize="2xl" fontWeight="semibold" mb="5">{data.title}</Text>
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
        <Box bg="white" rounded="md" p="3">
          <Text as="h3" fontSize="md">{data.description}</Text>
          {data.status === "Menunggu Jawaban" && (
            <Button bg="#4099f8" color="white" w="10%" mt="5" onClick={onOpen}>Mulai</Button>
          )}
          {data.status === "Menunggu Review" && (
            <Box>
              <Text fontSize="xl" mt="5" fontWeight="semibold">
                Selamat Anda telah menyelesaikan interview!
              </Text>
              <Text fontSize="xl" fontWeight="semibold">
                Tunggu HR untuk mereview jawaban Anda.
              </Text>
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
      )}
      <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={onClose} size="4xl">
        <ModalOverlay />
        {
          data.questions && questionIdx.current < data.questions.length ? (
            <ModalContent w="100%">
              <ModalHeader>Mulai Interview!</ModalHeader>
              <ModalCloseButton />
              <ModalBody pb={6}>
                <Text as="h1">{current.question}</Text>
                {!capturing && <Text as="h2" fontSize="sm">Batas waktu menjawab: {current.duration_limit} menit</Text>}
                {capturing && <Text as="h2" fontSize="sm">Sisa Waktu (detik): {timer}</Text>}
                <Webcam
                  height={540}
                  width={720}
                  audio={true}
                  muted={true}
                  mirrored={true}
                  ref={webcamRef}
                  videoConstraints={videoConstraints}
                />
                {capturing ? (
                  <Button bg="#4099f8" color="white" onClick={handleStopCaptureClick}>Stop</Button>
                ) : (
                  <Button bg="#4099f8" color="white" onClick={() => {
                    setTimer(current.duration_limit * 60);
                    handleStartCaptureClick();
                  }}>Mulai</Button>
                )}
              </ModalBody>
    
              <ModalFooter>
                <Button bg="#4099f8" color="white">
                  Lanjut
                </Button>
              </ModalFooter>
            </ModalContent>
          )
          : (
            <ModalContent w="100%">
              <ModalHeader>Mulai Interview!</ModalHeader>
              <ModalCloseButton />
              <ModalBody pb={6}>
                <Text as="h1">Anda telah menyelesaikan interview!</Text>
              </ModalBody>
    
              <ModalFooter>
                <Button bg="#4099f8" color="white">
                  Tutup
                </Button>
              </ModalFooter>
            </ModalContent>
          )
        }
      </Modal>
    </Layout>
  )
}

export default Detail;