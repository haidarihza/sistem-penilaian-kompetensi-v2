import React, { useState, useEffect, useContext } from 'react';
import { useParams } from "react-router-dom";
import Layout from "../../components/Layout";
import { ApiContext } from "../../utils/context/api";
import { RoomGroup } from '../../interface/room';
import {
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
  Tab,
  Text,
  Spinner,
  useToast,
  Box,
  Button
} from "@chakra-ui/react";
import Detail from './RoomDetail';
import { useNavigate } from 'react-router-dom';
import { getOneRoomGroup } from '../../api/room';
import { ApiError } from "../../interface/api";
import ToastModal from "../../components/ToastModal";
import { AuthContext } from "../../utils/context/auth";

const RoomGroupDetail = () => {
  const apiContext = useContext(ApiContext);
  const authContext = useContext(AuthContext);
  const params = useParams();
  const toast = useToast();
  const navigate = useNavigate();
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const role = authContext.auth?.role!;
  const [data, setData] = useState<RoomGroup>();

  const getLatestRoom = (data: RoomGroup) => {
    if (!data) return { status: "" };
    const latest = data.room.reduce((prev, current) => {
      return (new Date(prev.end) > new Date(current.end)) ? prev : current;
    });
  
    return latest;
  }
  const fetch = async () => {
    try {
      const res = await getOneRoomGroup(apiContext.axios, params.id!);
      // sort room by start date
      res.room.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
      setData(res);
      setActiveTabIndex(res.room.length - 1);
      if (res.room.length === 0) {
        navigate("/");
      }
    } catch(e) {
      if (e instanceof ApiError) {
        ToastModal(toast, "Error!", e.message, "error");
      } else {
        ToastModal(toast, "Error!", "Something Went Wrong", "error");
      }
    }
  }

  useEffect(() => {
    fetch();
  }, []);

  return (
    <Layout>
      <Box display="flex" flexDir="row" alignItems="center" justifyContent="space-between">
        <Text as="h1" fontSize="2xl" fontWeight="semibold">{data?.title}</Text>
        {role === "HRD" && getLatestRoom(data!).status === "ACCEPTED" && (
          <Button
          bg="main_blue"
          color="white"
          mr="4"
          isDisabled={getLatestRoom(data!).status !== "ACCEPTED"}
          onClick={() => navigate("/room/create", 
          {
            state: { 
              dataRoomGroup: {
                id: data?.id,
                title: data?.title,
                org_position: data?.org_position,
                interviewee_email: [data?.interviewee_email],
              }
            } 
          })}>Buat Interview Lanjutan</Button>
        )}
      </Box>
      <Tabs index={activeTabIndex} onChange={(index) => setActiveTabIndex(index)}>
        <TabList>
          {data ? data.room.map((room, idx) => (
            <Tab key={idx}>{room.title}</Tab>
          )) : <Spinner />}
        </TabList>
        <TabPanels>
          {data ? data.room.map((room, idx) => (
            <TabPanel p="0" pt="1" key={idx}>
              <Detail
                roomGroup={data}
                room_id={room.id}
                updateRoomGroup={fetch}
                />
            </TabPanel>
          )) : <Spinner />}
        </TabPanels>
      </Tabs>
    </Layout>
  );
}

export default RoomGroupDetail;