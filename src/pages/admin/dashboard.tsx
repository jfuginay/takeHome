import type { NextPageWithLayout } from "~/pages/_app";
import { AdminLayout } from "~/components/Global/Layout";
import { AuthRequired } from "~/components/Global/AuthRequired";
import {
  Flex,
  Text,
  useColorModeValue,
  Heading,
  Box,
} from "@chakra-ui/react";
import { RoleSets } from "~/common/roles";
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
import { api } from "~/utils/api";
import { StockData } from "~/types";

// Define interfaces based on the actual API response
interface AggregateResult {
  t: number;  // timestamp
  v: number;  // volume
  vw: number; // volume weighted average
  o: number;  // open
  c: number;  // close
  h: number;  // high
  l: number;  // low
  n: number;  // number of transactions
}

interface ApiResponse {
  adjusted: boolean;
  count: number;
  queryCount: number;
  request_id: string;
  results: AggregateResult[];
  resultsCount: number;
  status: string;
  ticker: string;
}

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard: NextPageWithLayout = () => {
  const optionTicker = "O:AAPL230519C00150000";
  const { data, isLoading, error } = api.stock.getOptionsData.useQuery<ApiResponse>({
    optionTicker,
    from: "2023-01-09",
    to: "2023-01-09",
  });

  const chartRef = useRef<ChartJS | null>(null);

  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current = null;
      }
    };
  }, []);

  const fallbackData: AggregateResult[] = [];

  const results: StockData[] = [];

  const chartData = {
    labels: results.map((item) =>
      new Date(item.toString()).toLocaleDateString()
    ),
    datasets: [
      {
        label: "Volume",
        data: results.map((item) => item.toString()),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: "category" as const,
        beginAtZero: true,
      },
      y: {
        type: "linear" as const,
        beginAtZero: true,
      },
    },
  };

  if (!optionTicker) {
    return <Text color="red.500">Ticker is not defined.</Text>;
  }

  if (isLoading) {
    return <Text>Loading data...</Text>;
  }

  if (error) {
    return (
      <Text color="red.500">
        Unable to fetch data. Please try again later. Error:{" "}
        {error.message || "Unknown error."}
      </Text>
    );
  }

  return (
    <AuthRequired roles={RoleSets.users}>
      <Flex justifyContent="space-evenly" mt="10" maxH="84.3vh" mx="5">
        <Flex flexDirection="column" w="100%" px="7">
          <Heading
            as="h2"
            fontSize="1.5rem"
            fontWeight="semi-bold"
            color={"gray.800"}
          >
            Options Dashboard {data?.ticker && `- ${data.ticker}`}
          </Heading>
          <Box
            p="4"
            bg={"gray.800"}
            borderRadius="md"
            overflowX="auto"
            height="400px"
          >
            <Chart
              type="bar"
              data={chartData}
              options={chartOptions}
            />
          </Box>
        </Flex>
      </Flex>
    </AuthRequired>
  );
};

Dashboard.getLayout = (page) => <AdminLayout>{page}</AdminLayout>;

export default Dashboard;
