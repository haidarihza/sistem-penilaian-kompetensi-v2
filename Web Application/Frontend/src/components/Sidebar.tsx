import { Box, Button, Text } from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface Props {
  role: string;
  logout: () => void;
}

const Sidebar = ({ role, logout } : Props) => {
  const navigate = useNavigate();
  
  const [index, setIndex] = useState<number>(0);

  const sideList = role === "INTERVIEWER" ? [{
    name: "Dashboard",
    url: "/"
  },
  {
    name: "Pertanyaan",
    url: "/question"
  },
  {
    name: "Kompetensi",
    url: "/competency"
  }] : [{
    name: "Dashboard",
    url: "/"
  },];

  const handleClick = (idx: number, url: string) => {
    setIndex(idx);
    navigate(url);
  }
  
  return (
    <Box display="flex" flexDir="column" justifyContent="space-between" h="full">
      <Box>
        <Text color="#4099f8" fontSize="2xl" fontWeight="bold">HireMIF</Text>
        <Box mt="5">
          {sideList.map((val, idx) => (
            <Button 
              key={idx}
              bg={idx === index ? "#ebf2ff" : "white"}
              fontSize="xl"
              fontWeight="bold"
              w="80%"
              mt="1"
              onClick={() => handleClick(idx, val.url)}
              _hover={{bg:"#ebf2ff"}}>
              {val.name}
            </Button>
          ))}
        </Box>
      </Box>
      <Box>
        <Button 
          w="80%" 
          color="#4099f8" 
          bg="white" 
          fontSize="xl" 
          fontWeight="bold" 
          _hover={{}}
          onClick={() => navigate("/profile")}>
          Akun
        </Button>
        <Button 
          w="80%" 
          color="white" 
          bg="#4099f8" 
          fontSize="xl" 
          fontWeight="bold" 
          mt="2"
          _hover={{}} 
          onClick={() => logout()}>
          Logout
        </Button>
      </Box>
    </Box>
  )
}

export default Sidebar;