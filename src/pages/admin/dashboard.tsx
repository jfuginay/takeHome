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
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import { useRef, useEffect } from "react";

// Register all required components for Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard: NextPageWithLayout = () => {
  const stocks = api.stock.getStockData.useQuery();

  // Chart ref to manage cleanup
  const chartRef = useRef<ChartJS | null>(null);

  useEffect(() => {
    // Cleanup chart when component unmounts
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, []);

  // Prepare chart data
  const chartData = {
    labels: stocks.data?.stockData?.map((stock) => stock.ticker) || [],
    datasets: [
      {
        label: "Close Price",
        data: stocks.data?.stockData?.map((stock) => stock.close) || [],
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: "category" as const, // Ensure the type is correctly specified
        beginAtZero: true,
      },
      y: {
        type: "linear" as const, // Ensure the type is correctly specified
        beginAtZero: true,
      },
    },
  };

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
              Stock Prices Bar Chart:
            </Text>
            <Box
              p="4"
              bg={useColorModeValue("gray.100", "gray.800")}
              borderRadius="md"
              overflowX="auto"
              height="400px" // Adjust height for better responsiveness
            >
              <Chart
                type="bar" // Specify the chart type
                data={chartData}
                options={chartOptions}
                ref={(ref) => {
                  if (ref) {
                    chartRef.current = ref;
                  }
                }}
              />
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
                <Text fontWeight="bold">{stock.ticker}</Text>
                <Text>Close: {stock.close}</Text>
                <Text>Open: {stock.open}</Text>
                <Text>High: {stock.high}</Text>
                <Text>Low: {stock.low}</Text>
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
