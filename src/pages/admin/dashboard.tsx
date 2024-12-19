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

// Register all required components for Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard: NextPageWithLayout = () => {
  // Fetch stock or options data
  const { data, isLoading, error } = api.stock.getOptionsData.useQuery({
    ticker: "O:SPY251219C00650000",
    from: "2023-01-09",
    to: "2023-01-09",
  });

  // Chart ref for lifecycle management
  const chartRef = useRef(null);

  useEffect(() => {
    // Cleanup chart instance when component unmounts
    return () => {
      if (chartRef.current) {
        chartRef.current = null;
      }
    };
  }, []);

  // Prepare chart data (use API data or mock data in case of errors)
  const chartData = {
    labels: data?.results?.map((item) =>
      new Date(item.t).toLocaleDateString() // Convert time from timestamp to readable date
    ) || ["Jan 9"],
    datasets: [
      {
        label: "Volume",
        data: data?.results?.map((item) => item.v) || [100], // Use `v` for volume
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

  // Loading and error states
  if (isLoading) {
    return <Text>Loading data...</Text>;
  }

  if (error) {
    return <Text color="red.500">Error loading data: {error.message}</Text>;
  }

  return (
    <AuthRequired roles={RoleSets.users}>
      <Flex justifyContent="space-evenly" mt="10" maxH="84.3vh" mx="5">
        <Flex flexDirection="column" w="100%" px="7">
          <Heading
            as="h2"
            fontSize="1.5rem"
            fontWeight="semi-bold"
            color={useColorModeValue("gray.800", "gray.100")}
          >
            Options Dashboard
          </Heading>
          <Box
            p="4"
            bg={useColorModeValue("gray.100", "gray.800")}
            borderRadius="md"
            overflowX="auto"
            height="400px"
          >
            <Chart
              type="bar"
              data={chartData}
              options={chartOptions}
              ref={chartRef}
            />
          </Box>
        </Flex>
      </Flex>
    </AuthRequired>
  );
};

Dashboard.getLayout = (page) => <AdminLayout>{page}</AdminLayout>;

export default Dashboard;
