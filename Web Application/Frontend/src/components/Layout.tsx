import { ReactNode, useContext, useEffect } from "react"
import { Box } from "@chakra-ui/react"
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../utils/context/auth";

interface Props {
  children?: ReactNode;
  title?: string;
}

const Layout = ({ children, title } : Props) => {
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  const role = authContext.auth?.role!;

  useEffect(() => {
    if (!authContext.isAuthenticated) {
      navigate('/login')
    }
  }, [authContext.isAuthenticated, navigate]);
  
  return (
    <Box h="100vh" w="100vw" display="flex" bgGradient="linear(to-b, #ebf2ff, #FFFFFF)">
      <Box h="100vh" w="15vw" boxShadow="2xl" py="5" rounded="md" bg="white" alignItems="center" textAlign="center">
        <Sidebar role={role} logout={authContext.logout} />
      </Box>
      <Box h="100vh" w="85vw" display="flex" flexDir="column" p="5" overflowY={'auto'}>
        {children}
      </Box>
    </Box>
  )
}

export default Layout;