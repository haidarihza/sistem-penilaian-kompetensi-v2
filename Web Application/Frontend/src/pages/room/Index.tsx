import Layout from "../../components/Layout";
import { useContext, useEffect, useState } from "react";
import { ApiContext } from "../../utils/context/api";
import { ApiError } from "../../interface/api";
import { getAllRoom } from "../../api/room";
import { RoomAll } from "../../interface/room";
import {
  Box,
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
  Card, 
  CardBody, 
  CardFooter
} from "@chakra-ui/react"
import { AuthContext } from "../../utils/context/auth";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  const apiContext = useContext(ApiContext);
  const authContext = useContext(AuthContext);

  const [data, setData] = useState<Array<RoomAll>>([] as Array<RoomAll>);
  const role = authContext.auth?.role;

  useEffect(() => {
    const fetch = async () => {
      try {
        const rooms = await getAllRoom(apiContext.axios);
        setData(rooms);
      } catch(e) {
        if (e instanceof ApiError) {
          alert(e.message);
        }
      }
    }

    fetch();
  }, []);
  
  return (
    <Layout>
      <Text as="h1" fontSize="2xl" fontWeight="semibold" mb="5">Dashboard</Text>
      {role === "INTERVIEWER" ? (
        <TableContainer bg="white" rounded="md">
          <Flex justifyContent="space-between" p="5">
            <Input maxW="40%" placeholder="Cari Ruangan" />
            <Button bg="#4099f8" color="white" onClick={() => navigate("/room/create")}>Buat Ruangan</Button>
          </Flex>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th textTransform="capitalize" w="40%">Ruangan</Th>
                <Th textTransform="capitalize">Kandidat</Th>
                <Th textTransform="capitalize">Waktu Berakhir</Th>
                <Th textTransform="capitalize">Waktu Submit</Th>
                <Th textTransform="capitalize">Status</Th>
                <Th textTransform="capitalize" textAlign="center">Aksi</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data ? data.map((val, idx) => (
                <Tr key={idx}>
                  <Td>{val.title}</Td>
                  <Td>{val.interviewee_name}</Td>
                  <Td>{val.end}</Td>
                  <Td>{val.submission}</Td>
                  <Td>{val.status}</Td>
                  <Td>
                    <Button onClick={() => navigate(`/room/${val.id}`)}>Detail</Button>
                  </Td>
                </Tr>
              )) : <Spinner />}
            </Tbody>
          </Table>
        </TableContainer>
      ) : (
        <Box display="flex">
          {data ? data.map((val, idx) => (
            <Card key={idx} width="30%" mr="2" onClick={() => navigate(`/room/${val.id}`)} cursor="pointer">
              <CardBody>
                <Text fontWeight="bold">{val.title}</Text>
              </CardBody>
              <CardFooter>
                <Text fontSize="sm" fontWeight="thin">Status: {val.status}</Text>
              </CardFooter>
            </Card>
          )) : <Spinner />}
        </Box>
      )}
    </Layout>
  )
}

export default Index;