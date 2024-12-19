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
  const { error, isLoading } = { error: null, isLoading: false };

  // Chart ref to manage cleanup
  const chartRef = useRef(null);

  useEffect(() => {
    // Cleanup chart when component unmounts
    return () => {
      if (chartRef.current) {
        chartRef.current = null;
      }
    };
  }, []);

  // Prepare chart data
  const chartData = {
    labels: ["Category 1", "Category 2", "Category 3", "Category 4"],
    datasets: [
      {
        label: "Sample Data",
        data: [10, 20, 30, 40],
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
        type: "category" as const, // Ensure the type is correctly specified
        beginAtZero: true,
      },
      y: {
        type: "linear" as const, // Ensure the type is correctly specified
        beginAtZero: false, // This can be set to false if you want the Y-axis to start from the lowest volume
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
                  color={useColorModeValue("gray.800", "gray.100")}
              >
                Stock Dashboard
              </Heading>

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
                    ref={chartRef}
                />
              </Box>
            </Flex>

          </Flex>
        </Flex>
      </AuthRequired>
  );
};

Dashboard.getLayout = (page) => <AdminLayout>{page}</AdminLayout>;

export default Dashboard;
