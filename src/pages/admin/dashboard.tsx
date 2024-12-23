import type { NextPageWithLayout } from "~/pages/_app";
import { AdminLayout } from "~/components/Global/Layout";
import { AuthRequired } from "~/components/Global/AuthRequired";
import {
  Flex,
  Text,
  Heading,
  Box,
  Table,
  Tbody,
  Tr,
  Td,
  Th,
  Thead,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { api } from "~/utils/api";
import { UserRole } from "@prisma/client";

interface ActiveStockData {
  ticker: string;
  name: string;
  market: string;
  locale: string;
  primary_exchange: string;
  type: string;
  active: boolean;
  currency_name: string;
  last_updated_utc: string;
}

const Dashboard: NextPageWithLayout = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const { data: session } = useSession();

  const {
    data: activeStocksData,
    isLoading: isLoadingActiveStocks,
    error: activeStocksError,
    refetch: refetchStocks
  } = api.stock.getTopActiveStocks.useQuery<ActiveStockData[]>(
    undefined,
    {
      enabled: !!selectedDate && !!session,
      retry: 1
    }
  );

  const handleDateChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
    await refetchStocks();
  };

  const renderActiveStocks = () => {
    if (isLoadingActiveStocks) {
      return <Text color="white">Loading top active stocks...</Text>;
    }

    if (activeStocksError) {
      return (
        <Text color="red.500">
          Unable to fetch active stocks data. Error:{" "}
          {activeStocksError.message || "Unknown error."}
        </Text>
      );
    }

    if (!activeStocksData || activeStocksData.length === 0) {
      return <Text color="gray.500">No active stocks data available for {selectedDate}.</Text>;
    }

    return (
      <Table variant="simple" colorScheme="teal" size="sm" mt="4">
        <Thead>
          <Tr>
            <Th color="white">Ticker</Th>
            <Th color="white">Name</Th>
            <Th color="white">Exchange</Th>
            <Th color="white">Market</Th>
            <Th color="white">Type</Th>
          </Tr>
        </Thead>
        <Tbody>
          {activeStocksData.map((stock: ActiveStockData, index: number) => (
            <Tr key={index}>
              <Td color="white" fontWeight="bold">{stock.ticker}</Td>
              <Td color="white">{stock.name}</Td>
              <Td color="white">{stock.primary_exchange}</Td>
              <Td color="white">{stock.market}</Td>
              <Td color="white">{stock.type}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    );
  };

  return (
    <AuthRequired roles={[UserRole.admin, UserRole.user, UserRole.owner]}>
      <Flex justifyContent="space-evenly" mt="10" maxH="84.3vh" mx="5">
        <Flex flexDirection="column" w="100%" px="7">
          <Heading
            as="h2"
            fontSize="1.5rem"
            fontWeight="semi-bold"
            color="white"
            mb="4"
          >
            Top Active Stocks
          </Heading>

          <FormControl mb="4">
            <FormLabel color="white">Select Date</FormLabel>
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              max={new Date().toISOString().split("T")[0]}
              style={{
                backgroundColor: "#2D3748",
                color: "white",
                borderColor: "#4A5568",
                padding: "8px",
                borderRadius: "4px",
                width: "100%"
              }}
            />
          </FormControl>

          <Box
            mb="6"
            bg="gray.800"
            p="4"
            borderRadius="md"
            border="1px"
            borderColor="gray.700"
          >
            <Heading as="h3" fontSize="1.25rem" fontWeight="medium" color="teal.300" mb="4">
              Top 5 Active Stocks for {selectedDate}
            </Heading>
            {renderActiveStocks()}
          </Box>
        </Flex>
      </Flex>
    </AuthRequired>
  );
};

Dashboard.getLayout = (page) => <AdminLayout>{page}</AdminLayout>;

export default Dashboard;