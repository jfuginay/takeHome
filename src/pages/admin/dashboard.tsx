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
import { RoleSets } from "~/common/roles";
import { useState } from "react";
import { api } from "~/utils/api";

interface StockVolume {
  ticker: string;
  name: string;
  market: string;
  primary_exchange: string;
  volume: number;
  price: number;
}

const Dashboard: NextPageWithLayout = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const {
    data: activeStocksData,
    isLoading: isLoadingActiveStocks,
    error: activeStocksError,
    refetch: refetchStocks
  } = api.stock.getTopActiveStocks.useQuery(
    { date: selectedDate },
    {
      enabled: !!selectedDate,
      retry: 1
    }
  );

  const handleDateChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
    await refetchStocks();
  };

  const formatVolume = (volume: number | null | undefined): string => {
    if (volume === null || volume === undefined) return 'N/A';

    const numVolume = Number(volume);
    if (isNaN(numVolume)) return 'Invalid';

    if (numVolume >= 1e9) {
      return `${(numVolume / 1e9).toFixed(2)}B`;
    } else if (numVolume >= 1e6) {
      return `${(numVolume / 1e6).toFixed(2)}M`;
    } else if (numVolume >= 1e3) {
      return `${(numVolume / 1e3).toFixed(2)}K`;
    }
    return numVolume.toFixed(0);
  };

  const formatPrice = (price: number | null | undefined): string => {
    if (price === null || price === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
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
            <Th color="white" isNumeric>Volume</Th>
            <Th color="white" isNumeric>Price</Th>
          </Tr>
        </Thead>
        <Tbody>
          {activeStocksData.map((stock, index) => (
            <Tr key={index}>
              <Td color="white" fontWeight="bold">{stock.ticker}</Td>
              <Td color="white">{stock.name}</Td>
              <Td color="white">{stock.primary_exchange}</Td>
              <Td color="white" isNumeric>{formatVolume(stock.volume)}</Td>
              <Td color="white" isNumeric>{formatPrice(stock.price)}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    );
  };

  return (
    <AuthRequired roles={RoleSets.users}>
      <Flex justifyContent="space-evenly" mt="10" maxH="84.3vh" mx="5">
        <Flex flexDirection="column" w="100%" px="7">
          <Heading
            as="h2"
            fontSize="1.5rem"
            fontWeight="semi-bold"
            color="white"
            mb="4"
          >
            Top Stocks by Trading Volume
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