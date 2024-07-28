import React, { useState, useEffect, useContext, useRef, useCallback } from "react";
import {
  Text,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Box,
  useToast,
  OrderedList,
  ListItem,
  Spinner
} from "@chakra-ui/react";
import Webcam from "react-webcam";
import { motion } from "framer-motion";
import { Question } from "../../interface/question";
import { answerQuestion, finishInterview, getQuestionDetail, updateRoomQuestion, uploadToStorage } from "../../api/room";
import { ApiError } from "../../interface/api";
import { ApiContext } from "../../utils/context/api";
import { RoomDetail } from "../../interface/room";
import ToastModal from "../../components/ToastModal";


interface Props {
  isOpen: boolean;
  onClose: () => void;
  room: RoomDetail;
  setRoom: (room: RoomDetail) => void;
  questions: Array<Question>;
  updateRoom: () => void;
}


const InterviewModal = ({
  isOpen,
  onClose,
  room,
  setRoom,
  questions,
  updateRoom,
}: Props) => {
  const apiContext = useContext(ApiContext);
  const toast = useToast();
  const MotionText = motion(Text);
  const [timer, setTimer] = useState<number>(0);
  const [prepTimer, setPrepTimer] = useState<number>(15);
  const [condition, setCondition] = useState<string>("PREPARING");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const webcamRef = useRef<Webcam>({} as Webcam);
  const [capturing, setCapturing] = useState<boolean>(false);
  const questionIdx = useRef<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder>({} as MediaRecorder);
  const [recordedChunks, setRecordedChunks] = useState<Array<BlobPart>>([] as Array<BlobPart>);
  const [current, setCurrent] = useState<Question>({} as Question);
  const videoConstraints = {
    width: 1080,
    height: 540,
    facingMode: "user",
  };

  const handleDataAvailable = useCallback(
    ({ data } : { data: Blob }) => {
      if (data.size > 0) {
        setRecordedChunks((prev) => prev.concat(data));
      }
    },
    [setRecordedChunks]
  );

  const handleStartCapture = useCallback(() => {
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
    if (mediaRecorderRef.current && typeof mediaRecorderRef.current.stop === 'function') {
      mediaRecorderRef.current.stop();
      setCapturing(false);
      setCondition("");
    }
  }, [mediaRecorderRef, setCapturing]);

  const checkWebcamReady = useCallback(() => {
    const intervalId = setInterval(() => {
      if (webcamRef.current && webcamRef.current.stream) {
        handleStartCapture();
        clearInterval(intervalId);
      }
    }, 100);
  }, [handleStartCapture]);

  const tick = () => {
    if (condition === "PREPARATION") {
      if (prepTimer === 0) {
        setCondition("ANSWERING");
        handleStartCapture();
      } else {
        setPrepTimer(prepTimer-1);
      }
    } else if (condition === "ANSWERING") {
      if (timer === 0) {
        handleStopCaptureClick();
      } else {
        setTimer(timer-1);
      }
    }
  }

  const submitAnswer = useCallback(() => {
    if (recordedChunks.length) {
      const blob = new Blob(recordedChunks, {
        type: "video/webm",
      });

      answer(blob);
      setRecordedChunks([]);
    }
  }, [recordedChunks]);

  const answer = async (blob: Blob) => {
    try {
      if (questionIdx.current < questions.length){
        setIsUploading(true);
        const link = await uploadToStorage(blob, room.id, room.questions[questionIdx.current].id);
        setIsUploading(false);
        questionIdx.current += 1;
        await answerQuestion(apiContext.axios, room.id, room.questions[questionIdx.current-1].id, link, room.language);
      }
    } catch(e) {
      console.log(e);
      if (e instanceof ApiError) {
        ToastModal(toast, "Error!", e.message, "error");
      } else {
        ToastModal(toast, "Error!", "Terjadi kesalahan", "error");
      }
    }
  }

  const handleEndInterview = async () => {
    await finishInterview(apiContext.axios, room.id);
    await updateRoom();
    onClose();
  }

  useEffect(() => {
    const timerId = setInterval(() => tick(), 1000);
    return () => clearInterval(timerId);
  });

  const newQuestion = async () => {
    if (questionIdx.current < questions.length){
      const question = await getQuestionDetail(apiContext.axios, room.id, questions[questionIdx.current].id);
      setCurrent(question);
      if (question.start_answer === "-") {
        const date = new Date()
        setTimer(question.duration_limit * 60);
        setPrepTimer(room.preparation_time);
        setCondition("PREPARATION");
        await updateRoomQuestion(apiContext.axios, room.id, questions[questionIdx.current].id, date, true, questionIdx.current);
      } else {
        setCondition("ANSWERING");
        const currDate = new Date();
        const startDate = new Date(question.start_answer);
        const differenceInMilliseconds = currDate.getTime() - startDate.getTime();
        const currTime = Math.floor(differenceInMilliseconds / 1000);
        if (currTime < question.duration_limit * 60 + 15) {
          setPrepTimer(0);
          setTimer(question.duration_limit * 60 - currTime);
          checkWebcamReady();
        } else {
          questionIdx.current += 1;
        }
      }  
    }
  }

  const handleStartInterview = () => {
    setRoom({...room, is_started: true});
    newQuestion();
  }

  useEffect(() => {
    if (isOpen && room.is_started){
      newQuestion();  
    }
  }, [isOpen, room, questionIdx.current])

  useEffect(() => {
    if (recordedChunks.length > 0 && !capturing) {
      submitAnswer();
    }
  }, [recordedChunks])

  const openingStatement = (
    <ModalContent w="100%">
      <ModalHeader textAlign="center" fontSize="2xl">Informasi & Petunjuk Interview</ModalHeader>
      <ModalBody pb={6}> 
        <Text mb="2" fontWeight="bold">
          Anda akan melakukan proses interview secara asinkron. Berikut adalah detail yang harus Anda perhatikan selama melakukan
          proses interview secara asinkron ini.
        </Text>
        <OrderedList w="70%">
          <ListItem mb="1">
            Pastikan device Anda dapat digunakan untuk melakukan perekaman video dan audio selama proses interview berlangsung (berikan akses kepada browser Anda untuk mengakses kamera dan audio Anda).
          </ListItem>
          <ListItem mb="1">
            Pastikan suara Anda dapat terdengar secara jelas ketika melakukan interview dan tidak ada gangguan suara yang membuat jawaban Anda tidak terdengar jelas.
          </ListItem>
          <ListItem mb="1">
            Pastikan Anda memiliki koneksi internet yang baik untuk mendukung proses interview ini.
          </ListItem>
        </OrderedList>
        <Text mt="6" mb="2" fontWeight="bold">
          Proses interview akan berjalan sebagai berikut:
        </Text>
        <OrderedList w="70%">
          <ListItem mb="1">
            Akan ada beberapa pertanyaan yang harus Anda jawab sesuai dengan waktu yang diberikan (waktu setiap pertanyaan memungkinkan berbeda)
          </ListItem>
          <ListItem mb="1">
            Anda akan diberi waktu {room.preparation_time} detik untuk mempersiapkan diri sebelum menjawab setiap pertanyaan.
          </ListItem>
          <ListItem mb="1">
            Waktu akan otomatis berjalan sesuai dengan batasan yang telah ditentukan. Anda dapat menjawab pertanyaan selama waktu itu atau dapat menghentikan ketika merasa sudah cukup.
          </ListItem>
          <ListItem mb="1">
            Pertanyaan akan otomatis berpindah ke pertanyaan berikutnya ketika Anda telah selesai menjawab pertanyaan atau waktu telah habis.
          </ListItem>
          <ListItem mb="1">
            Anda tidak dapat kembali ke pertanyaan sebelumnya.
          </ListItem>
          <ListItem mb="1">
            Ketika Anda menekan tombol "Mulai", artinya Anda akan memulai proses interview.
          </ListItem>
        </OrderedList>
      </ModalBody>
      <ModalFooter>
        <Button bg="white" color="main_blue" onClick={onClose} mr="2">
          Tutup
        </Button>
        <Button bg="main_blue" color="white" onClick={handleStartInterview}>
          Mulai
        </Button>
      </ModalFooter>
    </ModalContent>
  )

  const closingStatement = (
    <ModalContent w="100%">
      <ModalBody pb={6} display="flex" flexDir="column" justifyContent="center" alignItems="center">
        <Text fontWeight="extrabold" fontSize="2xl" mb="6">Selamat, Anda telah menjawab semua pertanyaan interview</Text>
        <Text>Silakan tutup halaman ini untuk menyelesaikannya</Text>
      </ModalBody>

      <ModalFooter>
        <Button bg="main_blue" color="white" onClick={handleEndInterview}>
          Tutup
        </Button>
      </ModalFooter>
    </ModalContent>
  )

  const interviewProcess = (
    <ModalContent w="100%">
      <ModalHeader fontSize="2xl" alignItems="center" textAlign="center">Interview</ModalHeader>
      <ModalBody pb={6}>
        <Box display="flex" flexDir="row" mb="2">
          <Webcam
            width="70%"
            audio={true}
            muted={true}
            mirrored={true}
            ref={webcamRef}
            videoConstraints={videoConstraints}
          />
          <Box display="flex" flexDir="column" w="40%" ml="4">
            <Box display="flex" flexDir="row" alignItems="baseline">
              <Box display="flex" flexDir="row" rounded="md" bg="main_blue" color="white" w="fit-content" px="4" mb="6" mr="2">
                <Text fontSize="lg" p="1">
                  {condition === "PREPARATION"
                    ? `${Math.floor(prepTimer / 60).toString().padStart(2, '0')} : ${(prepTimer % 60).toString().padStart(2, '0')}`
                    : `${Math.floor(timer / 60).toString().padStart(2, '0')} : ${(timer % 60).toString().padStart(2, '0')}`}
                </Text>
              </Box>
              <MotionText
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                color="main_blue"
                fontWeight="bold"
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
              >
                {condition === "PREPARATION" ? "Persiapan" : (condition === "ANSWERING" ? "Merekam" : "")}
              </MotionText>
            </Box>
            <Text fontWeight="bold">Pertanyaan ke-{questionIdx.current+1} ({current.duration_limit} menit)</Text>
            <Text>{current.question}</Text>
          </Box>
        </Box>
      </ModalBody>
      <ModalFooter>
        {capturing ? (
          <Box display="flex" flexDir="row" alignItems="flex-end" justifyContent="flex-end">
            <Button bg="red" color="white" onClick={handleStopCaptureClick}>Stop</Button>
          </Box>
        ) : null }
        {isUploading ? (
          <Box display="flex" flexDir="row" alignItems="flex-end" justifyContent="flex-end">
            <Spinner
              thickness='4px'
              speed='0.65s'
              emptyColor='gray.200'
              color='blue.500'
              size='md'
              mr="2"
            />
            <MotionText
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              color="main_blue"
              fontWeight="bold"
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            >
              Mengunggah
            </MotionText>
          </Box>
        ) : null }
      </ModalFooter>
    </ModalContent>
  )

  return (
    <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={onClose} size="full">
    <ModalOverlay />
    { !room.is_started ? openingStatement :
    questions && questionIdx.current < questions.length ? interviewProcess : closingStatement
    }
  </Modal>
  );
};

export default InterviewModal;