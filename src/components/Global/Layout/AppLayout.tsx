import React, { type ReactNode } from "react";
import {
  Box,
  Flex,
  useColorModeValue,
  Text,
} from "@chakra-ui/react";
import Image from "next/image";

export default function DefaultLayout({ children }: { children: ReactNode }) {
  return (
    <Box minH="100vh" >
      <Navbar />
      <Box>
        {children}
      </Box>
    </Box>
  );
}

const Navbar = ({ ...rest }) => {
  return (
    <Flex
      pl='5'
      height="20"
      alignItems="center"
      bg={"teal.500"}
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue("gray.200", "gray.700")}
      justifyContent={{ base: "space-between" }}
      {...rest}
    >
      <Flex w='full' justifyContent={{md: 'space-between', base: 'center'}} alignItems={'center'}>
        <Text display={{ base: 'none', md: 'inline-block' }} as='b' fontSize='2xl' color={'white'}>HedgePulse</Text>
        <img
            src={'/hedgepulse.png'}
            alt={"No Logo"}
        />
      </Flex>
    </Flex>
  );
};
