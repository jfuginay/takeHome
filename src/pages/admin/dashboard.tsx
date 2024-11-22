import type { NextPageWithLayout } from "~/pages/_app";
import { AdminLayout } from "~/components/Global/Layout";
import { AuthRequired } from "~/components/Global/AuthRequired";
import {
  Flex,
  Text,
  useColorModeValue,
  Heading,
  Stack,
  Box,
} from "@chakra-ui/react";
import { RoleSets } from "~/common/roles";
import { api } from "~/utils/api";

const Dashboard: NextPageWithLayout = () => {
  const stocks = api.stock.getStockData.useQuery();

  return (
    <AuthRequired roles={RoleSets.users}>
      <Flex justifyContent="space-evenly" mt="10" maxH="84.3vh" mx="5">
        <Flex flexDirection="column" w="100%" px="7">
          <Flex flexDirection="column">
            <Heading
              as="h2"
              fontSize="1.5rem"
              fontWeight="semi-bold"
              color="teal.500"
            >
              Stock Dashboard
            </Heading>
            <Text fontSize="1rem" color="gray.600" mb="4">
              Here is the JSON stock data:
            </Text>
            <Box
              p="4"
              bg={useColorModeValue("gray.100", "gray.800")}
              borderRadius="md"
              overflowX="auto"
            >
              <pre>{JSON.stringify(stocks.data, null, 2)}</pre>
            </Box>
          </Flex>
          <Stack overflowY="scroll" pr="1" pb="5" spacing="1rem" mt="4">
            {stocks.data?.stockData?.map((stock, idx) => (
              <Box
                key={idx}
                boxShadow="md"
                borderRadius="md"
                p="3"
                bg={useColorModeValue("white", "gray.700")}
              >
                <Text fontSize="1rem" color="gray.600">
                  <Text as="b">{stock.symbol ? stock.symbol : "Unnamed Stock"}</Text>
                </Text>
                <Text fontSize="0.9rem" color="gray.500">
                  Quantity: {stock.quantity}
                </Text>
              </Box>
            ))}
          </Stack>
        </Flex>
      </Flex>
    </AuthRequired>
  );
};

Dashboard.getLayout = (page) => <AdminLayout>{page}</AdminLayout>;

export default Dashboard;
