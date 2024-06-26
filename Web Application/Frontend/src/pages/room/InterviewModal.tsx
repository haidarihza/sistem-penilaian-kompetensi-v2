import React, { useState, useEffect, useContext, useRef, useCallback } from "react";
import {
  Text,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Box,
  useToast,
} from "@chakra-ui/react";
import Webcam from "react-webcam";
import { Question } from "../../interface/question";
import { answerQuestion, finishInterview } from "../../api/room";
import { ApiError } from "../../interface/api";
import { ApiContext } from "../../utils/context/api";
import { RoomDetail } from "../../interface/room";
import ToastModal from "../../components/ToastModal";


interface Props {
  isOpen: boolean;
  onClose: () => void;
  room: RoomDetail;
  questions: Array<Question>;
}


const InterviewModal = ({
  isOpen,
  onClose,
  room,
  questions,
}: Props) => {
  const apiContext = useContext(ApiContext);
  const toast = useToast();

  const [timer, setTimer] = useState<number>(0);
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
    if (mediaRecorderRef.current && typeof mediaRecorderRef.current.stop === 'function') {
      mediaRecorderRef.current.stop();
      setCapturing(false);
    }
  }, [mediaRecorderRef, setCapturing]);

  const tick = () => {
    if (timer === 0) {
      handleStopCaptureClick();
    } else {
      setTimer(timer-1);
    }
  }

  const handleSubmit = useCallback(() => {
    if (recordedChunks.length) {
      const blob = new Blob(recordedChunks, {
        type: "video/webm",
      });

      answer(blob);
      setRecordedChunks([]);
    }
  }, [recordedChunks]);

  const handleEndInterview = () => {
    finishInterview(apiContext.axios, room.id);
    onClose();
    // refresh page
    window.location.reload();
  }

  const answer = async (value : Blob) => {
    try {
      await answerQuestion(apiContext.axios, room.id, room.questions[questionIdx.current-1].id, value);
    } catch(e) {
      if (e instanceof ApiError) {
        ToastModal(toast, "Error!", e.message, "error");
      } else {
        ToastModal(toast, "Error!", "Terjadi kesalahan", "error");
      }
    }
  }

  useEffect(() => {
    const timerId = setInterval(() => tick(), 1000);
    return () => clearInterval(timerId);
  });

  useEffect(() => {
    if (questions?.length > 0) {
      setCurrent(questions[0]);
    }
  }, [questions]);

  useEffect(() => {
    if (recordedChunks.length > 0 && !capturing) {
      questionIdx.current += 1
      if (questionIdx.current < questions.length) {
        setCurrent(questions[questionIdx.current]);
      }
      handleSubmit();
    }
  }, [recordedChunks])

  return (
    <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={onClose} size="6xl">
    <ModalOverlay />
    {
      questions && questionIdx.current < questions.length ? (
        <ModalContent w="100%">
          <ModalHeader>Interview</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Box display="flex" flexDir="row" mb="2">
              <Webcam
                height={540}
                width={720}
                audio={true}
                muted={true}
                mirrored={true}
                ref={webcamRef}
                videoConstraints={videoConstraints}
              />
              <Box display="flex" flexDir="column" w="40%" ml="4">
                <Text fontWeight="bold">Pertanyaan ke-{questionIdx.current+1}</Text>
                <Text>{current.question}</Text>
              </Box>
            </Box>
            <Text fontSize="sm">Durasi Jawaban: (maksimal) {current.duration_limit} menit</Text>
            <Box display="flex" flexDir="row" rounded="md" bg="main_blue" color="white" w="fit-content" px="4">
              <Text fontSize="lg" p="1">{Math.floor(timer / 60).toString().padStart(2, '0')}:{(timer % 60).toString().padStart(2, '0')}</Text>
            </Box>
            <Text fontWeight="bold" fontSize="sm">Note</Text>
            <Text w="50%" fontSize="xs">Menekan tombol mulai akan memulai perekaman video dan waktu akan mulai berjalan mundur. Setelah waktu habis, maka akan otomatis ke pertanyaan selanjutnya</Text>

            {capturing ? (
              <Box display="flex" flexDir="row" alignItems="flex-end" justifyContent="flex-end">
                <Button bg="main_blue" color="white" onClick={handleStopCaptureClick}>Stop</Button>
              </Box>
            ) : (
              <Box display="flex" flexDir="row" alignItems="flex-end" justifyContent="flex-end">
                <Button bg="main_blue" color="white" onClick={() => {
                  setTimer(current.duration_limit * 60);
                  handleStartCaptureClick();
                }}>Mulai</Button>
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      )
      : (
        <ModalContent w="100%">
          <ModalHeader>Interview</ModalHeader>
          <ModalBody pb={6}>
            <Box display="flex" flexDir="row" mb="2" justifyContent="center">
              <Text as="h1">Anda telah menyelesaikan interview</Text>
            </Box>
          </ModalBody>

          <ModalFooter>
            <Button bg="main_blue" color="white" onClick={handleEndInterview}>
              Tutup
            </Button>
          </ModalFooter>
        </ModalContent>
      )
    }
  </Modal>
  );
};

export default InterviewModal;