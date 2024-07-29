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
import { statusColors } from "../../utils/utils";
import { formatDateTime } from "../../utils/utils";

interface Props {
  roomGroup: RoomGroup;
  handleDeleteConfirm: (id: string) => void;
  role: string;
}

const RoomCard = ({
  roomGroup,
  handleDeleteConfirm,
  role
}: Props) => {
  const navigate = useNavigate();

  const lastRoom = roomGroup.room?.reduce((prev, current) => {
    return (new Date(prev.end) > new Date(current.end)) ? prev : current;
  });

  const interviewerCard = (
      <Card key={roomGroup.id} width="30%" mr="4" mb="4" variant="outline">
      <CardHeader pt="2" pb="2" height="16">
        <Flex alignItems="center" gap="8" justifyContent="space-between">
          <Text
            fontSize="md"
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
                <DeleteIcon mr="1"/>
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
              <Box display="flex" flexDirection="column">
                <Box display="flex" alignItems="center">
                  <Text fontSize="sm" fontWeight="normal" width="40px">Start</Text>
                  <Text fontSize="sm" fontWeight="normal" width="10px">:</Text>
                  <Text fontSize="sm" fontWeight="normal">{formatDateTime(lastRoom?.start)}</Text>
                </Box>
                <Box display="flex" alignItems="center">
                  <Text fontSize="sm" fontWeight="normal" width="40px">End</Text>
                  <Text fontSize="sm" fontWeight="normal" width="10px">:</Text>
                  <Text fontSize="sm" fontWeight="normal">{formatDateTime(lastRoom?.end)}</Text>
                </Box>
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
                bg={statusColors.find((color) => color.status === lastRoom?.status)?.color}
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
            <Box display="flex" flexDirection="column">
              <Box display="flex" alignItems="center">
                <Text fontSize="sm" fontWeight="normal" width="40px">Start</Text>
                <Text fontSize="sm" fontWeight="normal" width="10px">:</Text>
                <Text fontSize="sm" fontWeight="normal">{formatDateTime(lastRoom?.start)}</Text>
              </Box>
              <Box display="flex" alignItems="center">
                <Text fontSize="sm" fontWeight="normal" width="40px">End</Text>
                <Text fontSize="sm" fontWeight="normal" width="10px">:</Text>
                <Text fontSize="sm" fontWeight="normal">{formatDateTime(lastRoom?.end)}</Text>
              </Box>
            </Box>
          </Box>
        </Box>
        <Box>
          <Box display="flex" flexDir="row" alignItems="center" mb="2" justifyContent="space-between">
            <Box
              bg={statusColors.find((color) => color.status === lastRoom?.status)?.color}
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
    </CardFooter>
  </Card>
  )

  return ["INTERVIEWER", "HRD"].includes(role) ? interviewerCard : intervieweeCard;
}

export default RoomCard;
