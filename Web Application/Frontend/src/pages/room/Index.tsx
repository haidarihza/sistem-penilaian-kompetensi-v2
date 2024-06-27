import Layout from "../../components/Layout";
import { useContext, useEffect, useState, useRef } from "react";
import { ApiContext } from "../../utils/context/api";
import { ApiError } from "../../interface/api";
import { getAllRoom, deleteRoom } from "../../api/room";
import { RoomAll } from "../../interface/room";
import {
  Box,
  Input,
  Flex, 
  Button, 
  Spinner, 
  Text,
  Card, 
  CardBody, 
  CardFooter,
  CardHeader,
  useToast,
  MenuList,
  MenuItem,
  Menu,
  MenuButton,
  IconButton,
  Stack,
  StackDivider,
  Divider,
  Icon,
  Tab,
  Tabs,
  TabList,
  TabPanel,
  TabPanels,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  useDisclosure,
} from "@chakra-ui/react"
import { AuthContext } from "../../utils/context/auth";
import { Link, useNavigate } from "react-router-dom";
import ToastModal from "../../components/ToastModal";
import { BsThreeDotsVertical, BsFillFilePersonFill } from "react-icons/bs";
import { DeleteIcon, CalendarIcon, EmailIcon } from "@chakra-ui/icons";

const Index = () => {
  const navigate = useNavigate();
  const apiContext = useContext(ApiContext);
  const authContext = useContext(AuthContext);
  const toast = useToast();
  const cancelRef = useRef(null);
  const colors = [{
    status: "WAITING ANSWER",
    color: "main_beige"
  }, {
    status: "WAITING REVIEW",
    color: "#E6F4F1"
  }, {
    status: "REJECTED",
    color: "#8CBCFF"
  }, {
    status: "ACCEPTED",
    color: "#8CBCFF"
  }];

  const [data, setData] = useState<Array<RoomAll>>([] as Array<RoomAll>);
  const [filteredData, setFilteredData] = useState<Array<RoomAll>>([] as Array<RoomAll>);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [deleteId, setDeleteId] = useState<string>("" as string);
  const role = authContext.auth?.role;
  const { isOpen: isOpenDelete, onOpen: onOpenDelete, onClose: onCloseDelete } = useDisclosure();

  const getScheduledRoom = (data: Array<RoomAll>) => {
    const currDate = new Date();
    return data.filter((val) => {
      const start = new Date(val.start);
      return start > currDate;
    });
  }

  const getOngoingRoom = (data: Array<RoomAll>) => {
    const currDate = new Date();
    return data.filter((val) => {
      const start = new Date(val.start);
      const end = new Date(val.end);
      return start < currDate && end > currDate;
    });
  }

  const getFinishedRoom = (data: Array<RoomAll>) => {
    const currDate = new Date();
    return data.filter((val) => {
      const end = new Date(val.end);
      return end < currDate;
    });
  }

  const tabList = [
    {
      title: "Semua",
      data: filteredData
    },
    {
      title: "Akan Datang",
      data: getScheduledRoom(filteredData)
    },
    {
      title: "Sedang Berjalan",
      data: getOngoingRoom(filteredData)
    },
    {
      title: "Selesai",
      data: getFinishedRoom(filteredData)
    }
  ];

  useEffect(() => {
    const fetch = async () => {
      try {
        const rooms = await getAllRoom(apiContext.axios);
        setData(rooms);
        setFilteredData(rooms);
      } catch(e) {
        if (e instanceof ApiError) {
          ToastModal(toast, "Error!", e.message, "error");
        } else {
          ToastModal(toast, "Error!", "Something Went Wrong", "error");
        }
      }
    }

    fetch();
  }, [data.length]);

  const filterAndSearchData = () => {
    if (searchTerm === "") {
      setFilteredData(data);
    } else {
      const filtered = data.filter((val) => {
        return val.title.toLowerCase().includes(searchTerm.toLowerCase());
      });
      setFilteredData(filtered);
    }
  }

  useEffect(() => {
    filterAndSearchData();
  }, [searchTerm, data]);

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };
  
  const handleDeleteConfirm = (id: string) => {
    setDeleteId(id);
    onOpenDelete();
  }

  const handleDeleteRoom = async (id: string) => {
    try {
      await deleteRoom(apiContext.axios, id);
      ToastModal(toast, "Success!", "Room Deleted", "success");
      setData(data.filter((val) => val.id !== id));
    } catch(e) {
      if (e instanceof ApiError) {
        ToastModal(toast, "Error!", e.message, "error");
      } else {
        ToastModal(toast, "Error!", "Something Went Wrong", "error");
      }
    } finally {
      onCloseDelete();
    }
  }


  return (
    <Layout>
      <Text as="h1" fontSize="2xl" fontWeight="semibold" mb="5">Dashboard</Text>
      <Tabs>
        <TabList>
          {tabList.map((tab, idx) => (
            <Tab key={idx}>{tab.title}</Tab>
          ))}
        </TabList>
        <TabPanels>
          {tabList.map((tab, idx) => (
            <TabPanel>
            {role === "INTERVIEWER" ? (
              <Box bg="white" rounded="md">
                <Flex justifyContent="space-between" p="5">
                  <Input 
                    maxW="60%" 
                    placeholder="Cari Pertanyaan" 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                  />
                  <Button bg="main_blue" color="white" mr="4" onClick={() => navigate("/room/create")}>Buat Ruangan</Button>
                </Flex>
                <Box display="flex" p="5" flexWrap="wrap" justifyContent="flex-start">
                  {tab.data ? tab.data.map((val, idx) => (
                    <Card key={idx} width="30%" mr="4" mb="4" variant="outline">
                      <CardHeader pt="2" pb="2" height="16">
                        <Flex alignItems="center" gap="8" justifyContent="space-between">
                          <Text
                            fontSize="lg"
                            fontWeight="bold"
                            noOfLines={2}
                            textOverflow="ellipsis"
                            overflow="hidden"
                            >{val.title}</Text>
                          <Menu placement="bottom-end">
                            <MenuButton as={IconButton} colorScheme="white.400" color="main_blue" icon={<BsThreeDotsVertical />}>
                            </MenuButton>
                            <MenuList>
                              <MenuItem onClick={() => handleDeleteConfirm(val.id)} color="main_blue">
                                <IconButton
                                  aria-label="Delete"
                                  icon={<DeleteIcon />}
                                  colorScheme='white.400'
                                  color="main_blue"
                                  size="sm"/>
                                Delete
                              </MenuItem>
                            </MenuList>
                          </Menu>
                        </Flex>
                      </CardHeader>
                      <Divider w="90%" mx="auto" borderWidth="1px" mb="4"/>
                      <CardBody pt="2" pb="2">
                        <Stack divider={<StackDivider/> } spacing={4}>
                          <Box display="flex" flexDir="column">
                            <Box display="flex" flexDir="row" alignItems="center" mb="4">
                              <Icon color="main_blue" mr="4" boxSize="25px" as={CalendarIcon} />
                              <Box display="flex" flexDir="column">
                                <Text fontSize="sm" fontWeight="normal">Start: {formatDateTime(val.start)}</Text>
                                <Text fontSize="sm" fontWeight="normal">End: {formatDateTime(val.end)}</Text>
                              </Box>
                            </Box>
                            <Box display="flex" flexDir="row" alignItems="center" mb="4">
                              <Icon color="main_blue" mr="4" boxSize="25px" as={BsFillFilePersonFill} />
                              <Text fontSize="sm" fontWeight="normal">{val.interviewee_name}</Text>
                            </Box>
                            <Box display="flex" flexDir="row" alignItems="center" mb="4">
                              <Icon color="main_blue" mr="4" boxSize="25px" as={EmailIcon} />
                              <Text fontSize="sm" fontWeight="normal">{val.interviewee_email}</Text>
                            </Box>
                          </Box>
                          <Box>
                            <Box display="flex" flexDir="row" alignItems="center" mb="2" justifyContent="space-between">
                              <Box
                                bg={colors.find((color) => color.status === val.status)?.color}
                                rounded="lg"
                                p="1">
                                <Text fontSize="sm" fontWeight="bold" color="main_blue">{val.status}</Text>
                              </Box>
                              <Text fontSize="sm" fontWeight="bold">{val.submission === "-" ? "No Submission" : formatDateTime(val.submission)}</Text>
                            </Box>
                          </Box>
                        </Stack>
                      </CardBody>
                      <Divider w="90%" mx="auto" borderWidth="1px"/>
                      <CardFooter pt="2" pb="2" justifyContent="flex-end">
                        <Link to={`/room/${val.id}`}>
                          <Text fontSize="sm" fontWeight="normal" color="main_blue" textDecoration="underline">Lihat Detail</Text>
                        </Link>
                      </CardFooter>
                    </Card>
                  )) : <Spinner />}
                </Box>
              </Box>
            ) : (
              <Box bg="white" rounded="md">
                <Flex justifyContent="space-between" p="5">
                  <Input maxW="40%" placeholder="Cari Ruangan" />
                </Flex>
                <Box display="flex" p="5" flexWrap="wrap" justifyContent="flex-start">
                  {tab.data ? tab.data.map((val, idx) => (
                    <Card key={idx} width="30%" mr="4" mb="4" variant="outline" cursor="pointer" onClick={() => navigate(`/room/${val.id}`)}>
                    <CardHeader pt="2" pb="2">
                      <Text fontSize="lg" fontWeight="bold" isTruncated maxWidth="100%">{val.title}</Text>
                    </CardHeader>
                    <Divider w="90%" mx="auto" borderWidth="1px" mb="4"/>
                    <CardBody pt="2" pb="2">
                      <Stack divider={<StackDivider/> } spacing={4}>
                        <Box display="flex" flexDir="column">
                          <Box display="flex" flexDir="row" alignItems="center" mb="4">
                            <Icon color="main_blue" mr="4" boxSize="25px" as={CalendarIcon} />
                            <Box display="flex" flexDir="column">
                              <Text fontSize="sm" fontWeight="normal">Start: {formatDateTime(val.start)}</Text>
                              <Text fontSize="sm" fontWeight="normal">End: {formatDateTime(val.end)}</Text>
                            </Box>
                          </Box>
                        </Box>
                      </Stack>
                    </CardBody>
                    <Divider w="90%" mx="auto" borderWidth="1px"/>
                    <CardFooter pt="2" pb="2" justifyContent="flex-end">
                      <Box display="flex" flexDir="row" alignItems="center" mb="2">
                        <Box
                          bg={colors.find((color) => color.status === val.status)?.color}
                          rounded="lg"
                          p="1"
                        >
                          <Text fontSize="sm" fontWeight="bold" color="main_blue">{val.status}</Text>
                        </Box>
                      </Box>
                    </CardFooter>
                  </Card>
                )) : <Spinner />}
              </Box>
            </Box>
            )}
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
      <AlertDialog
        isOpen={isOpenDelete}
        leastDestructiveRef={cancelRef}
        onClose={onCloseDelete}
        isCentered={true}
      >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize='lg' fontWeight='bold'>
            Hapus Ruangan
          </AlertDialogHeader>

          <AlertDialogBody>
            Apakah Anda yakin ingin menghapus ruangan ini?
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onCloseDelete}>
              Batal
            </Button>
            <Button colorScheme='red' onClick={() => handleDeleteRoom(deleteId)} ml={3}>
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