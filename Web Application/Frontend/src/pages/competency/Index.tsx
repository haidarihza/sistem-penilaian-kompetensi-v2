import Layout from "../../components/Layout";
import { useContext, useEffect, useState } from "react";
import { ApiContext } from "../../utils/context/api";
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
import { Competency, CompetencyLevel } from "../../interface/competency";
import { createCompetency, deleteCompetency, getAllCompetency, getOneCompetency, updateCompetency } from "../../api/competency";
import { FormField } from "../../interface/util";
import ModalForm from "../../components/ModalForm";

const Index = () => {
  const apiContext = useContext(ApiContext);

  const [data, setData] = useState<Array<Competency>>([] as Array<Competency>);
  const [competency, setCompetency] = useState<string>("");
  const isErrorCompetency = competency === "";
  const [levels, setLevels] = useState<Array<CompetencyLevel>>([] as Array<CompetencyLevel>);
  
  const [id, setId] = useState<string>("");
  const { isOpen:isOpenCreate, onOpen:onOpenCreate, onClose:onCloseCreate } = useDisclosure();
  const { isOpen:isOpenEdit, onOpen:onOpenEdit, onClose:onCloseEdit } = useDisclosure();

  const fields: Array<FormField> = [
    {
      isInvalid: isErrorCompetency, 
      label: "Kompetensi", 
      value: competency, 
      setValue: setCompetency,
      placeholder: "Kompetensi",
      invalidMessage: "Kompetensi wajib diisi"
    },
  ];

  const handleChangeLevels = (idx: number, key: string, value: string) => {
    let data = [...levels];
    data[idx][key as keyof CompetencyLevel] = value;
    setLevels(data);
  }

  const handleAddLevel = () => {
    setLevels([...levels, {
      level: "",
      description: ""
    } as CompetencyLevel])
  }
  
  const handleDeleteLevel = (idx: number) => {
    let data = [...levels];
    data.splice(idx, 1);
    setLevels(data);
  }
  
  const fetch = async () => {
    try {
      const competencies = await getAllCompetency(apiContext.axios);
      setData(competencies);
    } catch(e) {
      if (e instanceof ApiError) {
        alert(e.message);
      }
    }
  }
  
  useEffect(() => {
    setCompetency("");
    setLevels([]);

    fetch();
  }, [isOpenCreate, isOpenEdit]);

  const handleSubmitCreate = async () => {
    try {
      await createCompetency(apiContext.axios, competency, levels);
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
      const competency = await getOneCompetency(apiContext.axios, id);

      setCompetency(competency.competency);
      setLevels(competency.levels);
    } catch (e) {
      if (e instanceof ApiError) {
        alert(e.message);
      }
    }
  }

  const handleSubmitEdit = async () => {
    try {
      await updateCompetency(apiContext.axios, id, competency, levels);
    } catch (e) {
      if (e instanceof ApiError) {
        alert(e.message);
      }
    }
    onCloseEdit();
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteCompetency(apiContext.axios, id);
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
        title="Buat Kompetensi"
        fields={fields}
        dynamicFields={levels}
        handleDynamicFields={handleChangeLevels}
        handleDynamicAddField={handleAddLevel}
        handleDynamicDeleteField={handleDeleteLevel}
      />
      <ModalForm 
        isOpen={isOpenEdit} 
        onClose={onCloseEdit} 
        handleSubmit={handleSubmitEdit}
        title="Ubah Kompetensi"
        fields={fields}
        dynamicFields={levels}
        handleDynamicFields={handleChangeLevels}
        handleDynamicAddField={handleAddLevel}
        handleDynamicDeleteField={handleDeleteLevel}
      />
      <Text as="h1" fontSize="2xl" fontWeight="semibold">Koleksi Kompetensi</Text>
      <TableContainer bg="white" rounded="md">
        <Flex justifyContent="space-between" p="5">
          <Input maxW="40%" placeholder="Cari Kompetensi" />
          <Button bg="#4099f8" color="white" onClick={onOpenCreate}>Buat Kompetensi</Button>
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
            {data ? data.map((val) => (
              <Tr key={val.id}>
                <Td>{val.competency}</Td>
                <Td>
                  {val.levels.map((level) => (
                    <Text maxW="45rem" noOfLines={1} key={level.id}>{level.level}: {level.description}</Text>
                  ))}
                </Td>
                <Td>
                  <IconButton aria-label="Edit" mr="2" icon={<EditIcon />} onClick={() => {
                    setId(val.id);
                    handleClickEdit(val.id);
                  }} />
                  <IconButton aria-label="Delete" icon={<DeleteIcon />} onClick={() => handleDelete(val.id)} />
                  {/* <Button colorScheme="blue" mr="2" onClick={() => {
                    setId(val.id);
                    handleClickEdit(val.id);
                  }}>Edit</Button> */}
                  {/* <Button colorScheme="red" onClick={() => handleDelete(val.id)}>Hapus</Button> */}
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