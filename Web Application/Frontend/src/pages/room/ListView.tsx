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

const formatDateTime = (dateTimeString?: string) => {
  if (!dateTimeString) return "-";
  const date = new Date(dateTimeString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

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

interface RowProps {
  roomGroup: RoomGroup;
  handleDeleteConfirm: (id: string) => void;
}

const Row = ({
  roomGroup,
  handleDeleteConfirm,
}: RowProps) => {
  const latest_room = roomGroup.room.reduce((prev, current) => {
    return (new Date(prev.end) > new Date(current.end)) ? prev : current;
  });
  return (
  <Tr key={roomGroup.id}>
    <Td textAlign="center" w="15%" pt="1" pb="1" fontSize="sm">{roomGroup.title}</Td>
    <Td textAlign="center" w="15%" pt="1" pb="1" fontSize="sm">{roomGroup.interviewee_name}</Td>
    <Td textAlign="center" w="15%" pt="1" pb="1" fontSize="sm">{formatDateTime(latest_room.start)}</Td>
    <Td textAlign="center" w="15%" pt="1" pb="1" fontSize="sm">{formatDateTime(latest_room.end)}</Td>
    <Td textAlign="center" w="15%" pt="1" pb="1" fontSize="sm">{latest_room.submission === "-" ? "-" : formatDateTime(latest_room.submission)}</Td>
    <Td textAlign="center" w="15%" pt="1" pb="1" fontSize="sm">
      <Box
        display="flex"
        alignItems="center"
        w="fit-content"
        rounded="md"
        bg={colors.find((color) => color.status === latest_room?.status)?.color}
        >
        <Text fontSize="sm" fontWeight="semibold" color="main_blue" pl="1" pr="1">{latest_room.status}</Text>
      </Box>
    </Td>
    <Td textAlign="center" pt="1" pb="1" fontSize="sm">
      <Menu placement="bottom-end">
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
  </Tr>
  );
}

interface Props {
  filteredData: Array<RoomGroup>;
  handleDeleteConfirm: (id: string) => void;
}

const ListView = ({
  filteredData,
  handleDeleteConfirm,
}: Props) => {
  return (
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
            handleDeleteConfirm={handleDeleteConfirm}
          />
          ))}
        </Tbody>
      </Table>
    </Box>
  </TableContainer>
  );
}

export default ListView;