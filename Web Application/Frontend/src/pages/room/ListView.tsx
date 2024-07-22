import {
  Box,
  IconButton,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { RoomGroup } from '../../interface/room';
import { DeleteIcon } from '@chakra-ui/icons';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { useNavigate } from "react-router-dom";
import { statusColors } from '../../utils/utils';
import { formatDateTime } from '../../utils/utils';

interface RowProps {
  roomGroup: RoomGroup;
  role: string,
  handleDeleteConfirm: (id: string) => void;
}

const Row = ({
  roomGroup,
  role,
  handleDeleteConfirm,
}: RowProps) => {
  const navigate = useNavigate();
  const latest_room = roomGroup.room.reduce((prev, current) => {
    return (new Date(prev.end) > new Date(current.end)) ? prev : current;
  });

  const handleClicked = () => {
    navigate(`/room-group/${roomGroup.id}`);
  }
  return (
  <Tr key={roomGroup.id} _hover={{ bg: "gray.100" }} onDoubleClick={handleClicked}>
    <Td textAlign="center" w={role === "INTERVIEWER" ? "15%" : "20%"} pt="1" pb="1" fontSize="sm">{roomGroup.title}</Td>
    {role === "INTERVIEWER" &&
      <Td textAlign="center" w="15%" pt="1" pb="1" fontSize="sm">{roomGroup.interviewee_name}</Td>
    }
    <Td textAlign="center" w={role === "INTERVIEWER" ? "15%" : "20%"} pt="1" pb="1" fontSize="sm">{formatDateTime(latest_room.start)}</Td>
    <Td textAlign="center" w={role === "INTERVIEWER" ? "15%" : "20%"} pt="1" pb="1" fontSize="sm">{formatDateTime(latest_room.end)}</Td>
    <Td textAlign="center" w={role === "INTERVIEWER" ? "15%" : "20%"} pt="1" pb="1" fontSize="sm">{latest_room.submission === "-" ? "-" : formatDateTime(latest_room.submission)}</Td>
    <Td textAlign="center" w={role === "INTERVIEWER" ? "15%" : "20%"} pt="1" pb="1" fontSize="sm">
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        w="fit-content"
        rounded="md"
        mx="auto"
        bg={statusColors.find((color) => color.status === latest_room?.status)?.color}
        >
        <Text fontSize="sm" fontWeight="semibold" color="main_blue" pl="1" pr="1">{latest_room.status}</Text>
      </Box>
    </Td>
    {role === "INTERVIEWER" &&
      <Td textAlign="center" pt="1" pb="1" fontSize="sm">
        <Menu placement="left-start">
          <MenuButton as={IconButton} colorScheme="white.400" color="main_blue" icon={<BsThreeDotsVertical />}>
          </MenuButton>
          <MenuList>
            <MenuItem onClick={() => handleDeleteConfirm(roomGroup.id)} color="main_blue">
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
      </Td>
    }
  </Tr>
  );
}

interface Props {
  filteredData: Array<RoomGroup>;
  role: string,
  handleDeleteConfirm: (id: string) => void;
}

const ListView = ({
  filteredData,
  role,
  handleDeleteConfirm,
}: Props) => {
  const interviewerList = (
    <TableContainer bg="white" rounded="md">
      <Box overflowY="auto" maxHeight="90%">
        <Table variant="simple" colorScheme="blue">
          <Thead position="sticky" top="0" zIndex="1" bg="white">
            <Tr>
              <Th textTransform="capitalize" textAlign="center" w="15%">Ruangan</Th>
              <Th textTransform="capitalize" textAlign="center" w="15%">Kandidat</Th>
              <Th textTransform="capitalize" textAlign="center" w="15%">Mulai</Th>
              <Th textTransform="capitalize" textAlign="center" w="15%">Selesai</Th>
              <Th textTransform="capitalize" textAlign="center" w="15%">Submission</Th>
              <Th textTransform="capitalize" textAlign="center" w="15%">Status</Th>
              <Th textTransform="capitalize" textAlign="center" w="10%">Aksi</Th>
            </Tr>
          </Thead>
          <Tbody>
          {filteredData.map((val) => (
            <Row
              key={val.id}
              roomGroup={val}
              role={role}
              handleDeleteConfirm={handleDeleteConfirm}
            />
            ))}
          </Tbody>
        </Table>
      </Box>
    </TableContainer>
  )

  const intervieweeList = (
    <TableContainer bg="white" rounded="md">
      <Box overflowY="auto" maxHeight="90%">
        <Table variant="simple" colorScheme="blue">
          <Thead position="sticky" top="0" zIndex="1" bg="white">
            <Tr>
              <Th textTransform="capitalize" textAlign="center" w="20%">Ruangan</Th>
              <Th textTransform="capitalize" textAlign="center" w="20%">Mulai</Th>
              <Th textTransform="capitalize" textAlign="center" w="20%">Selesai</Th>
              <Th textTransform="capitalize" textAlign="center" w="20%">Submission</Th>
              <Th textTransform="capitalize" textAlign="center" w="20%">Status</Th>
            </Tr>
          </Thead>
          <Tbody>
          {filteredData.map((val) => (
            <Row
              key={val.id}
              roomGroup={val}
              role={role}
              handleDeleteConfirm={handleDeleteConfirm}
            />
            ))}
          </Tbody>
        </Table>
      </Box>
    </TableContainer>
  )

  return role === "INTERVIEWER" ? interviewerList : intervieweeList;
}

export default ListView;