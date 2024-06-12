import { Box, Image, Icon, Flex, Link, FlexProps } from "@chakra-ui/react";
import { IconType } from 'react-icons';
import { ReactText } from 'react';
import { useLocation } from "react-router-dom";
import { FiHome } from "react-icons/fi";
import { LuFileQuestion } from "react-icons/lu";
import { GiProgression } from "react-icons/gi";
import { VscFeedback, VscAccount } from "react-icons/vsc";
import { IoLogOutOutline } from "react-icons/io5";

interface NavItemProps extends FlexProps {
  icon: IconType;
  children: ReactText;
  link?: string;
  location: any;
  name?: string;
  onClick?: () => void;
}

const NavItem = ({ icon, children, link, location, name, onClick, ...rest }: NavItemProps) => {
  return (
    <Link href={link} style={{ textDecoration: 'none' }} _focus={{ boxShadow: 'none' }} onClick={onClick}>
      <Flex
        align="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        fontSize="lg"
        fontWeight="bold"
        textColor={name === "Log Out" ? "main_bg" : "main_blue"}
        cursor="pointer"
        bg={name === "Log Out" ? "main_blue" : (location.pathname === link ? "main_bg" : "white")}
        _hover={{
          bg: "main_bg",
          color: "main_blue",
        }}
        {...rest}>
        {icon && (
          <Icon
            mr="4"
            fontWeight="bold"
            fontSize="16"
            textColor={name === "Log Out" ? "main_bg" : "main_blue"}
            _groupHover={{
              color: 'main_blue',
            }}
            as={icon}
          />
        )}
        {children}
      </Flex>
    </Link>
  );
};
interface Props {
  role: string;
  logout: () => void;
}

const Sidebar = ({ role, logout } : Props) => {
  const location = useLocation();

  const sideList = role === "INTERVIEWER" ? [{
    name: "Dashboard",
    url: "/",
    icon: FiHome
  },
  {
    name: "Pertanyaan",
    url: "/question",
    icon: LuFileQuestion
  },
  {
    name: "Kompetensi",
    url: "/competency",
    icon: GiProgression
  },
  {
    name: "Umpan Balik",
    url: "/",
    icon: VscFeedback
  }] : [{
    name: "Dashboard",
    url: "/",
    icon: FiHome
  },];

  const secondList = [{
    name: "Profil",
    url: "/profile",
    icon: VscAccount
  },
  {
    name: "Log Out",
    icon: IoLogOutOutline,
    onClick: logout
  }]
  
  return (
    <Box display="flex" flexDir="column" justifyContent="space-between" h="full">
      <Box>
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Image src="../assets/hiremif_logo.png" alt="logo" w="70%"/>
      </Flex>
      {sideList.map((link) => (
        <NavItem key={link.name} icon={link.icon} link={link.url} location={location} mb="1">
          {link.name}
        </NavItem>
      ))}
      </Box>
      <Box>
      {secondList.map((link) => (
        <NavItem key={link.name} icon={link.icon} link={link.url} location={location} name={link.name} onClick={link.onClick} mb="1">
          {link.name}
        </NavItem>
      ))}
      </Box>
    </Box>
  )
}

export default Sidebar;