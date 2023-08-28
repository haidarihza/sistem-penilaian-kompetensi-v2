import { useContext, useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { ApiContext } from "../../utils/context/api";
import { AuthContext } from "../../utils/context/auth";
import { useNavigate } from "react-router-dom";
import { Box, Button, Flex, FormControl, FormLabel, IconButton, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Table, TableContainer, Tbody, Td, Text, Textarea, Th, Thead, Tr, useDisclosure } from "@chakra-ui/react";
import { createRoom } from "../../api/room";
import { ApiError } from "../../interface/api";
import { Question } from "../../interface/question";
import { Competency } from "../../interface/competency";
import { AddIcon, ChevronDownIcon, ChevronUpIcon, DeleteIcon } from "@chakra-ui/icons";
import { getAllQuestion } from "../../api/question";
import { getAllCompetency } from "../../api/competency";

const Detail = () => {
  const apiContext = useContext(ApiContext);
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  const [title, setTitle] = useState<string>("");
  const isErrorTitle = title === "";
  const [description, setDescription] = useState<string>("");
  const isErrorDescription = description === "";
  const [start, setStart] = useState<string>("");
  const isErrorStart = start === "";
  const [end, setEnd] = useState<string>("");
  const isErrorEnd = end === "";
  const [email, setEmail] = useState<string>("");
  const isErrorEmail = email === "";
  const [questions, setQuestions] = useState<Array<Question>>([]);
  const [competencies, setCompetencies] = useState<Array<Competency>>([]);

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
        alert(e.message);
      }
    }
  }

  const fetchC = async () => {
    try {
      const c = await getAllCompetency(apiContext.axios);
      setCompetencyCollections(c);
    } catch(e) {
      if (e instanceof ApiError) {
        alert(e.message);
      }
    }
  }
  
  useEffect(() => {
    if (role !== "INTERVIEWER") {
      navigate("/");
    }
  }, [role]);

  const handleClickAddQuestion = () => {
    fetchQ();
    onOpenQuestion();
  }

  const handleClickAddCompetency = () => {
    fetchC();
    onOpenCompetency();
  }

  const handleAddQuestion = (q: Question) => {
    let data = [...questions, q]
    setQuestions(data);
  }

  const handleAddCompetency = (c: Competency) => {
    let data = [...competencies, c]
    setCompetencies(data);
  }

  const handleUpQuestion = (idx: number) => {
    let up = questions[idx-1];
    let current = questions[idx];
    let data = [...questions];
    data[idx-1] = current;
    data[idx] = up;
    setQuestions(data);
  }

  const handleDownQuestion = (idx: number) => {
    let down = questions[idx+1];
    let current = questions[idx];
    let data = [...questions];
    data[idx+1] = current;
    data[idx] = down;
    setQuestions(data);
  }

  const handleUpCompetency = (idx: number) => {
    let up = competencies[idx-1];
    let current = competencies[idx];
    let data = [...competencies];
    data[idx-1] = current;
    data[idx] = up;
    setCompetencies(data);
  }

  const handleDownCompetency = (idx: number) => {
    let down = competencies[idx+1];
    let current = competencies[idx];
    let data = [...competencies];
    data[idx+1] = current;
    data[idx] = down;
    setCompetencies(data);
  }
  
  const handleDeleteCompetency = (idx: number) => {
    let data = [...competencies];
    data.splice(idx, 1);
    setCompetencies(data);
  }

  const handleDeleteQuestion = (idx: number) => {
    let data = [...questions];
    data.splice(idx, 1);
    setQuestions(data);
  }

  const handleSubmit = async () => {
    try {
      var questionsId = [];
      for (var q of questions) {
        questionsId.push(q.id);
      }

      var competenciesId = [];
      for (var c of competencies) {
        competenciesId.push(c.id);
      }
      
      const id = await createRoom(apiContext.axios, title,
        description, start, end, email, questionsId, competenciesId
      );

      navigate(`/room/${id}`)
    } catch(e) {
      if (e instanceof ApiError) {
        alert(e.message);
      }
    }
  }
  
  return (
    <Layout>
      <Modal isOpen={isOpenQuestion} onClose={onCloseQuestion} size="5xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Tambah Pertanyaan</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
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
                  {questionCollections.map((val, idx) => (
                    <Tr key={idx}>
                      <Td>{val.question}</Td>
                      <Td textAlign="center">{val.duration_limit} menit</Td>
                      <Td>
                        <IconButton size="sm" aria-label="Add" icon={<AddIcon />} onClick={() => handleAddQuestion(val)} />
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </ModalBody>
        </ModalContent>
      </Modal>
      <Modal isOpen={isOpenCompetency} onClose={onCloseCompetency} size="6xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Tambah Kompetensi</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <TableContainer bg="white" rounded="md">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th textTransform="capitalize" w="20%">Kompetensi</Th>
                    <Th textTransform="capitalize" w="70%">Level</Th>
                    <Th textTransform="capitalize" textAlign="center">Aksi</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {competencyCollections.map((val, idx) => (
                    <Tr key={idx}>
                      <Td>{val.competency}</Td>
                      <Td>
                        {val.levels.map((level) => (
                          <Text maxW="45rem" noOfLines={1} key={level.id}>{level.level}: {level.description}</Text>
                        ))}
                      </Td>
                      <Td>
                        <IconButton size="sm" aria-label="Add" icon={<AddIcon />} onClick={() => handleAddCompetency(val)} />
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </ModalBody>
        </ModalContent>
      </Modal>
      <Text as="h1" fontSize="2xl" fontWeight="semibold">Buat Ruangan Interview</Text>
      <Box as="form" onSubmit={e => {
        e.preventDefault();
        handleSubmit();
      }}>
        <Text mt="3" as="h2" fontSize="xl" fontWeight="semibold">Informasi Umum</Text>
        <Box bg="white" rounded="md" p="3">
          <FormControl isInvalid={isErrorTitle}>
            <FormLabel>Judul</FormLabel>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Judul Ruangan" />
          </FormControl>
          <FormControl isInvalid={isErrorDescription}>
            <FormLabel>Deskripsi</FormLabel>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Deskripsi Ruangan" />
          </FormControl>
          <FormControl isInvalid={isErrorStart}>
            <FormLabel>Waktu Mulai</FormLabel>
            <Input type="datetime-local" value={start} onChange={e => setStart(e.target.value)} placeholder="Waktu Mulai" />
          </FormControl>
          <FormControl isInvalid={isErrorEnd}>
            <FormLabel>Waktu Selesai</FormLabel>
            <Input type="datetime-local" value={end} onChange={e => setEnd(e.target.value)} placeholder="Waktu Selesai" />
          </FormControl>
          <FormControl isInvalid={isErrorEmail}>
            <FormLabel>Email Kandidat</FormLabel>
            <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Kandidat" />
          </FormControl>
        </Box>

        <Text mt="3" as="h2" fontSize="xl" fontWeight="semibold">Kompetensi yang dinilai</Text>
        <TableContainer bg="white" rounded="md">
          <Flex justifyContent="space-between" p="5">
            <IconButton size="sm" aria-label="Add" icon={<AddIcon />} onClick={handleClickAddCompetency} />
          </Flex>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th textTransform="capitalize" w="20%">Kompetensi</Th>
                <Th textTransform="capitalize" w="70%">Level</Th>
                <Th textTransform="capitalize" textAlign="center">Aksi</Th>
              </Tr>
            </Thead>
            <Tbody>
              {competencies.map((val, idx) => (
                <Tr key={idx}>
                  <Td>{val.competency}</Td>
                  <Td>
                    {val.levels.map((level) => (
                      <Text maxW="45rem" noOfLines={1} key={level.id}>{level.level}: {level.description}</Text>
                    ))}
                  </Td>
                  <Td>
                    {idx !== 0 && <IconButton size="xs" aria-label="Delete" icon={<ChevronUpIcon />} onClick={() => handleUpCompetency(idx)} />}
                    <IconButton display="block" size="xs" aria-label="Delete" icon={<DeleteIcon />} onClick={() => handleDeleteCompetency(idx)} />
                    {idx !== competencies.length-1 && <IconButton size="xs" aria-label="Delete" icon={<ChevronDownIcon />} onClick={() => handleDownCompetency(idx)} />}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>

        <Text mt="3" as="h2" fontSize="xl" fontWeight="semibold">Pertanyaan</Text>
        <TableContainer bg="white" rounded="md">
          <Flex justifyContent="space-between" p="5">
            <IconButton size="sm" aria-label="Add" icon={<AddIcon />} onClick={handleClickAddQuestion} />
          </Flex>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th textTransform="capitalize" w="90%">Pertanyaan</Th>
                <Th textTransform="capitalize" textAlign="center">Batas Durasi</Th>
                <Th textTransform="capitalize" textAlign="center">Aksi</Th>
              </Tr>
            </Thead>
            <Tbody>
              {questions.map((val, idx) => (
                <Tr key={idx}>
                  <Td>{val.question}</Td>
                  <Td textAlign="center">{val.duration_limit} menit</Td>
                  <Td>
                    {idx !== 0 && <IconButton size="xs" aria-label="Delete" icon={<ChevronUpIcon />} onClick={() => handleUpQuestion(idx)} />}
                    <IconButton display="block" size="xs" aria-label="Delete" icon={<DeleteIcon />} onClick={() => handleDeleteQuestion(idx)} />
                    {idx !== questions.length-1 && <IconButton size="xs" aria-label="Delete" icon={<ChevronDownIcon />} onClick={() => handleDownQuestion(idx)} />}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
        <Button bg="#4099f8" color="white" type="submit">Kirim</Button>
      </Box>
    </Layout>
  )
}

export default Detail;