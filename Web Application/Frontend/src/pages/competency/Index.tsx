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
  Box,
  Text,
  useDisclosure,
  IconButton,
  useToast,
} from "@chakra-ui/react"
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { Competency, CompetencyLevel } from "../../interface/competency";
import { createCompetency, deleteCompetency, getAllCompetency, updateCompetency } from "../../api/competency";
import CompetencyModal from "./CompetencyModal";
import DetailsCompetencyModal from "./DetailsCompetencyModal";
import ToastModal from "../../components/ToastModal";

const Index = () => {
  const apiContext = useContext(ApiContext);
  const toast = useToast();

  const [data, setData] = useState<Array<Competency>>([] as Array<Competency>);
  const [filteredData, setFilteredData] = useState<Array<Competency>>([] as Array<Competency>);
  const [competency, setCompetency] = useState<Competency>({
    id: "",
    competency: "",
    description: "",
    levels: [] as Array<CompetencyLevel>
  } as Competency);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const { isOpen:isOpenModal, onOpen:onOpenModal, onClose:onCloseModal } = useDisclosure();
  const { isOpen:isOpenDetails, onOpen:onOpenDetails, onClose:onCloseDetails } = useDisclosure();
    
  const fetch = async () => {
    try {
      const competencies = await getAllCompetency(apiContext.axios);
      setData(competencies);
      setFilteredData(competencies);
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

  useEffect(() => {
    setFilteredData(data.filter(competency =>
      competency.competency.toLowerCase().includes(searchTerm.toLowerCase()) ||
      competency.description.toLowerCase().includes(searchTerm.toLowerCase())
    ));
  }, [searchTerm, data]);

  const handleClickCreate = () => {
    setIsEdit(false);
    setCompetency({
      id: "",
      competency: "",
      description: "",
      levels: [] as Array<CompetencyLevel>
    } as Competency);
    onOpenModal();
  }

  const handleClickEdit = (id: string) => {
    setIsEdit(true);
    setCompetency(data.find((val) => val.id === id) as Competency);
    onOpenModal();  
  }

  const handleSubmitCreate = async () => {
    try {
      if (competency.levels.length > 0) {
        competency.levels = competency.levels.filter((level) => level.level !== "" && level.description !== "");
      }

      await createCompetency(apiContext.axios, competency.competency, competency.description, competency.levels);
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
      await updateCompetency(apiContext.axios, competency.id, competency.competency, competency.description, competency.levels);
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
      await deleteCompetency(apiContext.axios, id);
      fetch();
    } catch (e) {
      if (e instanceof ApiError) {
        ToastModal(toast, "Error!", e.message, "error");
      } else {
        ToastModal(toast, "Error!", "Terjadi kesalahan pada server.", "error");
      }
    }
  }

  const handleSeeDetails = async (id: string) => {
    setCompetency(data.find((val) => val.id === id) as Competency);
    onOpenDetails();
  }
  
  return (
    <Layout>
      <CompetencyModal
        isOpen={isOpenModal}
        onClose={onCloseModal}
        handleSubmit={isEdit ? handleSubmitEdit : handleSubmitCreate}
        title={isEdit ? "Ubah Kompetensi" : "Buat Kompetensi"}
        competency={competency}
        setCompetency={setCompetency}
        buttonContent={isEdit ? "Ubah" : "Buat"}
      />
      <DetailsCompetencyModal
        isOpen={isOpenDetails}
        onClose={onCloseDetails}
        handleSubmit={handleSubmitCreate}
        title={competency.competency}
        competency={competency}
      />
      <Text as="h1" fontSize="2xl" fontWeight="semibold">Koleksi Kompetensi</Text>
      <TableContainer bg="white" rounded="md">
        <Flex justifyContent="space-between" p="5">
          <Input 
            maxW="60%" 
            placeholder="Cari Kompetensi" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
          <Button bg="main_blue" color="white" onClick={handleClickCreate}>Buat Kompetensi</Button>
        </Flex>
        <Box overflowY="auto" maxHeight="80%">
          <Table variant="simple" colorScheme="blue">
            <Thead position="sticky" top="0" zIndex="1" bg="white">
              <Tr>
                <Th textTransform="capitalize" w="20%">Kompetensi</Th>
                <Th textTransform="capitalize" textAlign="center" w="60%">Deskripsi</Th>
                <Th textTransform="capitalize" textAlign="center" w="10%">Level</Th>
                <Th textTransform="capitalize" textAlign="center">Aksi</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredData.map((val) => (
                <Tr key={val.id}>
                  <Td w="20%">{val.competency}</Td>
                  <Td w="60%" whiteSpace="normal" overflow="hidden" textOverflow="ellipsis">
                    {val.description}
                  </Td>
                  <Td w="10%">
                    {val.levels.map((level) => (
                      <Text maxW="10rem" noOfLines={1} key={level.id}>{level.level}: {level.description}</Text>
                    ))}
                    <Text
                      cursor="pointer"
                      color="blue.500"
                      textDecoration="underline"
                      _hover={{ color: "blue.700" }}
                      onClick={() => handleSeeDetails(val.id)}
                    >
                    Lihat detail
                    </Text>
                  </Td>
                  <Td>
                    <IconButton aria-label="Edit" mr="2" bg="main_blue" color="white" icon={<EditIcon />} onClick={() => {handleClickEdit(val.id)}} />
                    <IconButton aria-label="Delete" bg="main_blue" color="white" icon={<DeleteIcon />} onClick={() => handleDelete(val.id)} />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </TableContainer>
    </Layout>
  )
}

export default Index;