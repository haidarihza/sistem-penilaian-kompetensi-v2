import Layout from "../../components/Layout";
import { useContext, useEffect, useState, useRef } from "react";
import { ApiContext } from "../../utils/context/api";
import { createQuestion, deleteQuestion, getAllQuestion, updateQuestion, getQuestionLabelOptions } from "../../api/question";
import { Question, QuestionLabel, QuestionLabelOptions } from "../../interface/question";
import { ApiError } from "../../interface/api";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Input,
  Flex, 
  Button, 
  Box,
  Text,
  useDisclosure,
  IconButton,
  useToast,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react"
import { EditIcon, DeleteIcon, SmallCloseIcon } from "@chakra-ui/icons";
import QuestionModal from "./QuestionModal";
import LabelFilterPopover from "./LabelFilterPopover";
import ToastModal from "../../components/ToastModal";

const Index = () => {
  const apiContext = useContext(ApiContext);
  const toast = useToast();
  const cancelRef = useRef(null);

  const [data, setData] = useState<Array<Question>>([] as Array<Question>);
  const [filteredData, setFilteredData] = useState<Array<Question>>([] as Array<Question>);
  const [question, setQuestion] = useState<Question>({
    id: "",
    question: "",
    duration_limit: 0,
    labels: [] as Array<QuestionLabel>
  } as Question);
  const [labelOptions, setLabelOptions] = useState<Array<QuestionLabelOptions>>([] as Array<QuestionLabelOptions>);
  const [labelFilter, setLabelFilter] = useState<Array<QuestionLabelOptions>>([] as Array<QuestionLabelOptions>);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [deleteId, setDeleteId] = useState<string>("" as string);
  const { isOpen:isOpenModal, onOpen:onOpenModal, onClose:onCloseModal } = useDisclosure();
  const { isOpen: isOpenDelete, onOpen: onOpenDelete, onClose: onCloseDelete } = useDisclosure();

  const fetch = async () => {
    try {
      const questions = await getAllQuestion(apiContext.axios);
      setData(questions);
      setFilteredData(questions);
      const labelOptions = await getQuestionLabelOptions(apiContext.axios);
      setLabelOptions(labelOptions);
    } catch(e) {
      if (e instanceof ApiError) {
        ToastModal(toast, "Error!", e.message, "error");
      } else {
        ToastModal(toast, "Error!", "Terjadi kesalahan pada server.", "error");
      }
    }
  }
  
  useEffect(() => {
    fetch();
  }, [isOpenModal]);

  const filterAndSearchData = () => {
    if (searchTerm.trim() === '' && labelFilter.length === 0) {
      setFilteredData(data); // Show all data if no filter or search term
    } else {
      const filtered = data.filter((val) => {
        const isSearchMatch = val.question.toLowerCase().includes(searchTerm.toLowerCase());
        const isLabelMatch = labelFilter.length === 0 || labelFilter.every((label) => val.labels.map((val) => val.competency_id).includes(label.id));
        return isSearchMatch && isLabelMatch;
      });
      setFilteredData(filtered);
    }
  };

  useEffect(() => {
    filterAndSearchData();
  }, [searchTerm, labelFilter, data]);

  const handleClickCreate = () => {
    setIsEdit(false);
    setQuestion({
      id: "",
      question: "",
      duration_limit: 0,
      labels: [] as Array<QuestionLabel>
    } as Question);
    onOpenModal();
  }

  const handleClickEdit = (id: string) => {
    setIsEdit(true);
    setQuestion(data.find((val) => val.id === id) as Question);
    onOpenModal();
  }

  const handleSubmitCreate = async () => {
    try {
      await createQuestion(apiContext.axios, question.question, question.duration_limit, question.labels);
      onCloseModal();
    } catch (e) {
      if (e instanceof ApiError) {
        ToastModal(toast, "Error!", e.message, "error");
      } else {
        ToastModal(toast, "Error!", "Terjadi kesalahan pada server.", "error");
      }
    }
  }

  const handleSubmitEdit = async () => {
    try {
      await updateQuestion(apiContext.axios, question.id, question.question, question.duration_limit, question.labels);
      onCloseModal();
    } catch (e) {
      if (e instanceof ApiError) {
        ToastModal(toast, "Error!", e.message, "error");
      } else {
        ToastModal(toast, "Error!", "Terjadi kesalahan pada server.", "error");
      }
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteQuestion(apiContext.axios, id);
      fetch();
    } catch (e) {
      if (e instanceof ApiError) {
        ToastModal(toast, "Error!", e.message, "error");
      } else {
        ToastModal(toast, "Error!", "Terjadi kesalahan pada server.", "error");
      }
    } finally {
      onCloseDelete();
    }
  }

  const handleDeleteConfirm = (id: string) => {
    setDeleteId(id);
    onOpenDelete();
  }

  const handleDeleteLabel = (idx: number) => () => {
    const newLabels = labelFilter.filter((_, index) => index !== idx) as Array<QuestionLabelOptions>;
    setLabelFilter(newLabels);
    filterAndSearchData();
  }

  const handleApplyFilter = (filteredLabels: Array<QuestionLabelOptions>) => {
    setLabelFilter(filteredLabels);
    filterAndSearchData();
  }

  return (
    <Layout>
      <QuestionModal 
        isOpen={isOpenModal} 
        onClose={onCloseModal} 
        handleSubmit={isEdit ? handleSubmitEdit : handleSubmitCreate}
        title={isEdit ? "Edit Pertanyaan" : "Buat Pertanyaan"}
        question={question} 
        setQuestion={setQuestion}
        labelOptions={labelOptions}
        buttonContent={isEdit ? "Ubah" : "Buat"}
      />
      <Text as="h1" fontSize="2xl" fontWeight="semibold">Koleksi Pertanyaan</Text>
      <TableContainer bg="white" rounded="md">
        <Flex justifyContent="space-between" p="5">
          <Input 
            maxW="60%" 
            placeholder="Cari Pertanyaan" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
          <Button bg="main_blue" color="white" onClick={handleClickCreate}>Buat Pertanyaan</Button>
        </Flex>
        <Box display="flex" alignItems="center">
          <LabelFilterPopover
            labelOptions={labelOptions}
            filteredLabels={labelFilter}
            handleApplyFilter={handleApplyFilter}
          />
          <Box display="flex" flexDir="row" flexWrap="wrap" mt="2">
            {labelFilter.map((val, idx) => (
            <Box key={idx} display="flex" alignItems="center" w="fit-content" rounded="md" bg="main_blue" mr="2" mb="2">
              <Text fontSize="sm" fontWeight="normal" color="white" ml="1">
                {val.competency}
              </Text>
              <IconButton
                aria-label="Delete"
                icon={<SmallCloseIcon />}
                colorScheme="white.400"
                size="xs"
                onClick={handleDeleteLabel(idx)}
              />
            </Box>
            ))}
          </Box>
        </Box>
        <Box overflowY="auto" maxHeight="80%">
          <Table variant="simple" colorScheme="blue">
            <Thead position="sticky" top="0" zIndex="1" bg="white">
              <Tr>
                <Th textTransform="capitalize" w="40%">Pertanyaan</Th>
                <Th textTransform="capitalize" textAlign="center">Batas Durasi</Th>
                <Th textTransform="capitalize" w="30%" textAlign="center">Label</Th>
                <Th textTransform="capitalize" textAlign="center">Aksi</Th>
              </Tr>
            </Thead>
            <Tbody>
            {filteredData.map((val) => (
                <Tr key={val.id}>
                  <Td w="50%" whiteSpace="normal" overflow="hidden" textOverflow="ellipsis">{val.question}</Td>
                  <Td textAlign="center">{val.duration_limit} menit</Td>
                  <Td textAlign="center">
                    <Box display="flex" flexDir="row" p="0" flexWrap="wrap" justifyContent="center">
                      {val.labels.map((val, idx) => (
                      <Box key={idx} display="flex" alignItems="center" w="fit-content" rounded="md" bg="second_blue" mr="2" mb="2">
                        <Text fontSize="sm" fontWeight="normal" color="white" pl="1" pr="1">
                          {labelOptions.find((label) => label.id === val.competency_id)?.competency}
                        </Text>
                      </Box>
                      ))}
                    </Box>
                  </Td>
                  <Td>
                    <IconButton aria-label="Edit" mr="2" bg="main_blue" color="white" icon={<EditIcon />} onClick={() => handleClickEdit(val.id)} />
                    <IconButton aria-label="Delete" bg="main_blue" color="white" icon={<DeleteIcon />} onClick={() => handleDeleteConfirm(val.id)} />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </TableContainer>
      <AlertDialog
          isOpen={isOpenDelete}
          leastDestructiveRef={cancelRef}
          onClose={onCloseDelete}
          isCentered={true}
        >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Hapus Pertanyaan
            </AlertDialogHeader>

            <AlertDialogBody>
              Apakah Anda yakin ingin menghapus pertanyaan ini?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onCloseDelete}>
                Batal
              </Button>
              <Button colorScheme='red' onClick={() => handleDelete(deleteId)} ml={3}>
                Hapus
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Layout>
  )
}

export default Index;