import Layout from "../../components/Layout";
import { useContext, useEffect, useState, useRef } from "react";
import { ApiContext } from "../../utils/context/api";
import { ApiError } from "../../interface/api";
import { getAllRoomGroup } from "../../api/room";
import { RoomGroup } from "../../interface/room";
import {
  Box,
  Input,
  Flex, 
  Button, 
  Spinner, 
  Text,
  useToast,
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
  IconButton,
} from "@chakra-ui/react"
import { AuthContext } from "../../utils/context/auth";
import { useNavigate } from "react-router-dom";
import ToastModal from "../../components/ToastModal";
import RoomCard from "./RoomCard";
import ListView from "./ListView";
import { IoList, IoGrid } from "react-icons/io5";

const Index = () => {
  const navigate = useNavigate();
  const apiContext = useContext(ApiContext);
  const authContext = useContext(AuthContext);
  const toast = useToast();
  const cancelRef = useRef(null);

  const [data, setData] = useState<Array<RoomGroup>>([] as Array<RoomGroup>);
  const [filteredData, setFilteredData] = useState<Array<RoomGroup>>([] as Array<RoomGroup>);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [deleteId, setDeleteId] = useState<string>("" as string);
  const role = authContext.auth?.role;
  const { isOpen: isOpenDelete, onOpen: onOpenDelete, onClose: onCloseDelete } = useDisclosure();
  const [view, setView] = useState<"LIST" | "GRID">("GRID");

  const getLatestRoom = (data: RoomGroup) => {
    const latest = data.room.reduce((prev, current) => {
      return (new Date(prev.end) > new Date(current.end)) ? prev : current;
    });
  
    return latest;
  };

  const getScheduledRoom = (data: Array<RoomGroup>) => {
    const currDate = new Date();
    return data.filter((val) => {
      const latest_room = getLatestRoom(val);
      if (!latest_room) return false;
      const start = new Date(latest_room.start);
      return start > currDate;
    });
  };

  const getOngoingRoom = (data: Array<RoomGroup>) => {
    const currDate = new Date();
    return data.filter((val) => {
      const latest_room = getLatestRoom(val);
      if (!latest_room) return false;
      const start = new Date(latest_room.start);
      const end = new Date(latest_room.end);
      return start < currDate && end > currDate;
    });
  };

  const getFinishedRoom = (data: Array<RoomGroup>) => {
    const currDate = new Date();
    return data.filter((val) => {
      const latest_room = getLatestRoom(val);
      if (!latest_room) return false;
      const end = new Date(latest_room.end);
      return end < currDate;
    });
  };

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
        const room_groups = await getAllRoomGroup(apiContext.axios);
        setData(room_groups);
        setFilteredData(room_groups);
      } catch(e) {
        if (e instanceof ApiError) {
          ToastModal(toast, "Error!", e.message, "error");
        } else {
          ToastModal(toast, "Error!", "Something Went Wrong", "error");
        }
      }
    }
    fetch();
  }, []);

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
  
  const handleDeleteConfirm = (id: string) => {
    setDeleteId(id);
    onOpenDelete();
  }

  const handleDeleteRoom = async (id: string) => {
    // delete room
    console.log("hapus grup ruangan");
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
            <TabPanel key={idx}>
              <Box bg="white" rounded="md">
                <Flex justifyContent="space-between" p="5" pr="10">
                <Box display="flex" flexDir="row" w="80%">
                    <Input
                      maxW="60%"
                      placeholder="Cari Ruangan"
                      mr="4"
                      value={searchTerm} 
                      onChange={(e) => setSearchTerm(e.target.value)} 
                    />
                    {["INTERVIEWER", "HRD"].includes(role!) && (
                      <Button bg="main_blue" color="white" mr="4" onClick={() => navigate("/room/create")}>Buat Ruangan</Button>   
                    )}
                  </Box>
                  <Box display="flex" flexDir="row">
                    <IconButton 
                      isActive={view === "GRID"}
                      aria-label="Grid View"
                      bg="white" 
                      color="main_blue" 
                      border="1px"
                      borderRight="0"
                      icon={<IoGrid />}
                      onClick={() => {setView("GRID")}}
                      sx={{
                        borderTopRightRadius: 0,
                        borderBottomRightRadius: 0,
                      }}
                    />
                    <IconButton 
                      isActive={view === "LIST"}
                      aria-label="List View"
                      bg="white"
                      color="main_blue" 
                      border="1px"
                      icon={<IoList fontSize="xl"/>} 
                      onClick={() => {setView("LIST")}}
                      sx={{
                        borderTopLeftRadius: 0,
                        borderBottomLeftRadius: 0,
                      }}
                    />
                  </Box>
                </Flex>
                {view === "GRID" && (
                <Box display="flex" p="5" flexWrap="wrap" justifyContent="flex-start">
                  {tab.data ? tab.data.map((val, idx) => (
                    <RoomCard
                      key={idx}
                      roomGroup={val}
                      handleDeleteConfirm={handleDeleteConfirm}
                      role={role ? role : "INTERVIEWEE"}
                    />
                  )) : <Spinner />}
                </Box>
                )}
                {view === "LIST" && (
                  <ListView
                    key={idx}
                    filteredData={tab.data}
                    role={role ? role : "INTERVIEWEE"}
                    handleDeleteConfirm={handleDeleteConfirm}
                  />
                )}
              </Box>
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