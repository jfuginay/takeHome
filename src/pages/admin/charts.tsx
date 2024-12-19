import type { NextPageWithLayout } from "~/pages/_app";
import { AdminLayout } from "~/components/Global/Layout";
import { AuthRequired } from "~/components/Global/AuthRequired";
import {
    Flex, Text, useColorModeValue, Heading, Box, Select,
} from "@chakra-ui/react";
import { RoleSets } from "~/common/roles";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";
import { useRef, useEffect, useState } from "react";
import { restClient } from "@polygon.io/client-js"; // Polygon.io client import

// Register required components for Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Initialize the `rest` client for Polygon.io
const rest = restClient(process.env.POLY_API_KEY || ""); // Use your actual API key here

const ChartsPage: NextPageWithLayout = () => {
    const [selectedStock, setSelectedStock] = useState<string>("AAPL");
    const [chartData, setChartData] = useState<any>(null); // State to store chart data
    const chartRef = useRef<ChartJS | null>(null);

    // Predefined list of the main 5 stocks
    const stockOptions = ["AAPL", "SPY", "QQQ", "MSFT", "GOOGL"];

    // Cleanup ChartJS instance when unmounting the component
    useEffect(() => {
        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
                chartRef.current = null;
            }
        };
    }, []);

    // Fetch stock option aggregates when the selected stock changes
    useEffect(() => {
        const fetchStockData = async () => {
            if (!selectedStock) return;
            try {
                const data = await rest.options.aggregates(
                  selectedStock, // Selected stock
                  1, // Multiplier (1 day)
                  "day", // Timespan (per day)
                  "2023-01-01", // Start date
                  "2023-04-14" // End date
                );
                console.log(`Data for ${selectedStock}:`, data);
                setChartData(formatChartData(data)); // Format and set chart data
            } catch (error) {
                console.error("Error fetching stock data:", error);
            }
        };

        fetchStockData();
    }, [selectedStock]);

    // Handle stock selection change
    const handleStockChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedStock(event.target.value);
    };

    // Format fetched data for Chart.js
    const formatChartData = (data: any) => {
        if (!data || !data.results || data.results.length === 0) return null;

        return {
            labels: data.results.map((entry: any) => new Date(entry.t).toLocaleDateString()), // Map dates
            datasets: [
                {
                    label: "Open Price",
                    data: data.results.map((entry: any) => entry.o), // Open prices
                    backgroundColor: "rgba(54, 162, 235, 0.5)",
                    borderColor: "rgba(54, 162, 235, 1)",
                    borderWidth: 1,
                },
                {
                    label: "Close Price",
                    data: data.results.map((entry: any) => entry.c), // Close prices
                    backgroundColor: "rgba(255, 99, 132, 0.5)",
                    borderColor: "rgba(255, 99, 132, 1)",
                    borderWidth: 1,
                },
            ],
        };
    };

    // Chart options configuration
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
                      <Text fontSize="1rem" color={useColorModeValue("gray.600", "gray.400")} mb="4">
                          Select a stock to see detailed options statistics:
                      </Text>
                      {/* Dropdown to select a stock */}
                      <Select value={selectedStock} onChange={handleStockChange} placeholder="Select stock">
                          {stockOptions.map((stock) => (
                            <option key={stock} value={stock}>
                                {stock}
                            </option>
                          ))}
                      </Select>
                  </Flex>

                  {/* Chart section */}
                  <Box mt={5}>
                      {chartData ? (
                        <Bar options={chartOptions} data={chartData} />
                      ) : (
                        <Text color="gray.500">Select a stock to view its options aggregate data.</Text>
                      )}
                  </Box>
              </Flex>
          </Flex>
      </AuthRequired>
    );
};

ChartsPage.getLayout = (page) => <AdminLayout>{page}</AdminLayout>;

export default ChartsPage;
