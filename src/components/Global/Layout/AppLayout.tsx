import React from 'react';
import Link from 'next/link';
import { Box, Flex, useColorModeValue, Text, HStack } from "@chakra-ui/react";
import { ReactNode } from "react";

const Navbar: React.FC<React.HTMLAttributes<HTMLElement>> = ({ ...rest }) => {
  const borderBottomColor = useColorModeValue("gray.700", "gray.200");
  const bgColor = useColorModeValue("gray.800", "white");
  const textColor = useColorModeValue("white", "gray.800");

  return (
      <Flex
          pl="5"
          height="20"
          alignItems="center"
          bg={bgColor}
          borderBottomWidth="1px"
          borderBottomColor={borderBottomColor}
          justifyContent={{ base: "space-between" }}
          {...rest}
      >
        <Flex w="full" justifyContent={{ md: 'space-between', base: 'center' }} alignItems="center">
          <Text display={{ base: 'none', md: 'inline-block' }} as="b" fontSize="2xl" color={textColor}>TechGear Sign In
          </Text>

          <img src="/techGearLogo.png" alt="No Logo" />
        </Flex>
      </Flex>
  );
};

const DefaultLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const mainBgColor = useColorModeValue("gray.900", "gray.100");
  const textColor = useColorModeValue("white", "black");

  return (
      <Box minH="100vh" bg={mainBgColor} color={textColor}>
        <Navbar />
        <Box mx={{ base: 4, md: 8 }} my={{ base: 4, md: 6 }} maxW="1200px" w="full">
          {children}
        </Box>
      </Box>
  );
};

export default DefaultLayout;
