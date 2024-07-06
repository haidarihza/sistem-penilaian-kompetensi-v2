import { RoomGroup } from "../../interface/room";
import { 
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Text,
  Flex,
  Menu,
  MenuButton,
  IconButton,
  MenuList,
  MenuItem,
  Stack,
  Box,
  Icon,
  Divider,
  StackDivider,
} from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import { BsThreeDotsVertical } from "react-icons/bs";
import { DeleteIcon, CalendarIcon, EmailIcon } from "@chakra-ui/icons";
import { BsFillFilePersonFill } from "react-icons/bs";

interface Props {
  roomGroup: RoomGroup;
  handleDeleteConfirm: (id: string) => void;
  role: string;
}

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

const RoomCard = ({
  roomGroup,
  handleDeleteConfirm,
  role
}: Props) => {
  const navigate = useNavigate();

  const lastRoom = roomGroup.room?.reduce((prev, current) => {
    return (new Date(prev.end) > new Date(current.end)) ? prev : current;
  });

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

  const interviewerCard = (
      <Card key={roomGroup.id} width="30%" mr="4" mb="4" variant="outline">
      <CardHeader pt="2" pb="2" height="16">
        <Flex alignItems="center" gap="8" justifyContent="space-between">
          <Text
            fontSize="lg"
            fontWeight="bold"
            noOfLines={2}
            textOverflow="ellipsis"
            overflow="hidden"
            >{roomGroup.title}</Text>
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
        </Flex>
      </CardHeader>
      <Divider w="90%" mx="auto" borderWidth="1px" mb="4"/>
      <CardBody pt="2" pb="2">
        <Stack divider={<StackDivider/> } spacing={4}>
          <Box display="flex" flexDir="column">
            <Box display="flex" flexDir="row" alignItems="center" mb="4">
              <Icon color="main_blue" mr="4" boxSize="25px" as={CalendarIcon} />
              <Box display="flex" flexDir="column">
                <Text fontSize="sm" fontWeight="normal">Start: {formatDateTime(lastRoom?.start)}</Text>
                <Text fontSize="sm" fontWeight="normal">End: {formatDateTime(lastRoom?.end)}</Text>
              </Box>
            </Box>
            <Box display="flex" flexDir="row" alignItems="center" mb="4">
              <Icon color="main_blue" mr="4" boxSize="25px" as={BsFillFilePersonFill} />
              <Text fontSize="sm" fontWeight="normal">{roomGroup.interviewee_name}</Text>
            </Box>
            <Box display="flex" flexDir="row" alignItems="center" mb="4">
              <Icon color="main_blue" mr="4" boxSize="25px" as={EmailIcon} />
              <Text fontSize="sm" fontWeight="normal">{roomGroup.interviewee_email}</Text>
            </Box>
          </Box>
          <Box>
            <Box display="flex" flexDir="row" alignItems="center" mb="2" justifyContent="space-between">
              <Box
                bg={colors.find((color) => color.status === lastRoom?.status)?.color}
                rounded="lg"
                p="1">
                <Text fontSize="sm" fontWeight="bold" color="main_blue">{lastRoom?.status}</Text>
              </Box>
              <Text fontSize="sm" fontWeight="bold">{lastRoom?.submission === "-" ? "No Submission" : formatDateTime(lastRoom?.submission)}</Text>
            </Box>
          </Box>
        </Stack>
      </CardBody>
      <Divider w="90%" mx="auto" borderWidth="1px"/>
      <CardFooter pt="2" pb="2" justifyContent="flex-end">
        <Link to={`/room-group/${roomGroup.id}`}>
          <Text fontSize="sm" fontWeight="normal" color="main_blue" textDecoration="underline">Lihat Detail</Text>
        </Link>
      </CardFooter>
    </Card>
    )
  
  const intervieweeCard = (
    <Card key={roomGroup.id} width="30%" mr="4" mb="4" variant="outline" cursor="pointer" onClick={() => navigate(`/room-group/${roomGroup.id}`)}>
    <CardHeader pt="2" pb="2">
      <Text fontSize="lg" fontWeight="bold" isTruncated maxWidth="100%">{roomGroup.title}</Text>
    </CardHeader>
    <Divider w="90%" mx="auto" borderWidth="1px" mb="4"/>
    <CardBody pt="2" pb="2">
      <Stack divider={<StackDivider/> } spacing={4}>
        <Box display="flex" flexDir="column">
          <Box display="flex" flexDir="row" alignItems="center" mb="4">
            <Icon color="main_blue" mr="4" boxSize="25px" as={CalendarIcon} />
            <Box display="flex" flexDir="column">
              <Text fontSize="sm" fontWeight="normal">Start: {formatDateTime(lastRoom.start)}</Text>
              <Text fontSize="sm" fontWeight="normal">End: {formatDateTime(lastRoom.end)}</Text>
            </Box>
          </Box>
        </Box>
      </Stack>
    </CardBody>
    <Divider w="90%" mx="auto" borderWidth="1px"/>
    <CardFooter pt="2" pb="2" justifyContent="flex-end">
      <Box display="flex" flexDir="row" alignItems="center" mb="2">
        <Box
          bg={colors.find((color) => color.status === lastRoom.status)?.color}
          rounded="lg"
          p="1"
        >
          <Text fontSize="sm" fontWeight="bold" color="main_blue">{lastRoom.status}</Text>
        </Box>
      </Box>
    </CardFooter>
  </Card>
  )

  return role === "INTERVIEWER" ? interviewerCard : intervieweeCard;
}

export default RoomCard;
