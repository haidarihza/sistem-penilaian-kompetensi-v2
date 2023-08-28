import Layout from "../../components/Layout";
import { useContext, useEffect, useState } from "react";
import { ApiContext } from "../../utils/context/api";
import { createQuestion, deleteQuestion, getAllQuestion, getOneQuestion, updateQuestion } from "../../api/question";
import { Question } from "../../interface/question";
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
  Spinner, 
  Text,
  useDisclosure,
  IconButton,
} from "@chakra-ui/react"
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import ModalForm from "../../components/ModalForm";
import { FormField } from "../../interface/util";

const Index = () => {
  const apiContext = useContext(ApiContext);

  const [data, setData] = useState<Array<Question>>([] as Array<Question>);
  const [question, setQuestion] = useState<string>("");
  const isErrorQuestion = question === "";
  const [durationLimit, setDurationLimit] = useState<number>(0);
  const isErrorDurationLimit = durationLimit === 0;
  
  const [id, setId] = useState<string>("");
  const { isOpen:isOpenCreate, onOpen:onOpenCreate, onClose:onCloseCreate } = useDisclosure();
  const { isOpen:isOpenEdit, onOpen:onOpenEdit, onClose:onCloseEdit } = useDisclosure();
  
  const fields: Array<FormField> = [
    {
      isInvalid: isErrorQuestion, 
      label: "Pertanyaan", 
      value: question, 
      setValue: setQuestion,
      placeholder: "Pertanyaan",
      invalidMessage: "Pertanyaan wajib diisi"
    },
    {
      isInvalid: isErrorDurationLimit, 
      label: "Batas Durasi", 
      type: "number",
      value: durationLimit, 
      setValue: setDurationLimit,
      invalidMessage: "Batas Durasi harus lebih dari 0 menit"
    },
  ];

  const fetch = async () => {
    try {
      const questions = await getAllQuestion(apiContext.axios);
      setData(questions);
    } catch(e) {
      if (e instanceof ApiError) {
        alert(e.message);
      }
    }
  }
  
  useEffect(() => {
    setQuestion("");
    setDurationLimit(0);

    fetch();
  }, [isOpenCreate, isOpenEdit]);
  
  const handleSubmitCreate = async () => {
    try {
      await createQuestion(apiContext.axios, question, durationLimit);
    } catch (e) {
      if (e instanceof ApiError) {
        alert(e.message);
      }
    }
    onCloseCreate();
  }

  const handleClickEdit = async (id: string) => {
    onOpenEdit();
    try {
      const question = await getOneQuestion(apiContext.axios, id);

      setQuestion(question.question);
      setDurationLimit(question.duration_limit);
    } catch (e) {
      if (e instanceof ApiError) {
        alert(e.message);
      }
    }
  }

  const handleSubmitEdit = async () => {
    try {
      await updateQuestion(apiContext.axios, id, question, durationLimit);
    } catch (e) {
      if (e instanceof ApiError) {
        alert(e.message);
      }
    }
    onCloseEdit();
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteQuestion(apiContext.axios, id);
      fetch();
    } catch (e) {
      if (e instanceof ApiError) {
        alert(e.message);
      }
    }
  }
  
  return (
    <Layout>
      <ModalForm 
        isOpen={isOpenCreate} 
        onClose={onCloseCreate} 
        handleSubmit={handleSubmitCreate}
        title="Buat Pertanyaan"
        fields={fields}
      />
      <ModalForm 
        isOpen={isOpenEdit} 
        onClose={onCloseEdit} 
        handleSubmit={handleSubmitEdit}
        title="Ubah Pertanyaan"
        fields={fields}
      />
      <Text as="h1" fontSize="2xl" fontWeight="semibold">Koleksi Pertanyaan</Text>
      <TableContainer bg="white" rounded="md">
        <Flex justifyContent="space-between" p="5">
          <Input maxW="40%" placeholder="Cari Pertanyaan" />
          <Button bg="#4099f8" color="white" onClick={onOpenCreate}>Buat Pertanyaan</Button>
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
            {data ? data.map((val, idx) => (
              <Tr key={idx}>
                <Td>{val.question}</Td>
                <Td textAlign="center">{val.duration_limit} menit</Td>
                <Td>
                  <IconButton aria-label="Edit" mr="2" icon={<EditIcon />} onClick={() => {
                    setId(val.id);
                    handleClickEdit(val.id);
                  }} />
                  <IconButton aria-label="Delete" icon={<DeleteIcon />} onClick={() => handleDelete(val.id)} />
                </Td>
              </Tr>
            )) : <Spinner />}
          </Tbody>
        </Table>
      </TableContainer>
    </Layout>
  )
}

export default Index;