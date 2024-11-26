import type { NextPageWithLayout } from "~/pages/_app";
import { AdminLayout } from "~/components/Global/Layout";
import { AuthRequired } from "~/components/Global/AuthRequired";
import {
    Flex, Text, useColorModeValue, Heading, Box, Select,
} from "@chakra-ui/react";
import { RoleSets } from "~/common/roles";
import { api } from "~/utils/api";
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useRef, useEffect, useState } from "react";

// Register all required components for Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ChartsPage: NextPageWithLayout = () => {
    const { data, error, isLoading } = api.stock.getStockData.useQuery({ dataType: "activeStocks" });
    const [selectedStock, setSelectedStock] = useState<string | undefined>(undefined);
    const [stockDetail, setStockDetail] = useState<any>(null);

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

    useEffect(() => {
        if (selectedStock && data) {
            const stock = data.top1000StocksByVolume.find(item => item.ticker === selectedStock);
            setStockDetail(stock || null);
        }
    }, [selectedStock, data]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    const handleStockChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedStock(event.target.value);
    };

    // Placeholder data for charts
    const placeholderData = {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        datasets: [
            {
                label: 'Stat 1',
                data: [10, 20, 30, 40, 50, 60, 70],
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
            },
            {
                label: 'Stat 2',
                data: [70, 60, 50, 40, 30, 20, 10],
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                type: 'category' as const,
                beginAtZero: true,
            },
            y: {
                type: 'linear' as const,
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
                            Select a stock to see detailed statistics:
                        </Text>
                        <Select placeholder="Select stock" onChange={handleStockChange}>
                            {data?.top1000StocksByVolume.map(stock => (
                                <option key={stock.ticker} value={stock.ticker}>
                                    {stock.name} ({stock.ticker})
                                </option>
                            ))}
                        </Select>
                        {stockDetail && (
                            <Box mt="4">
                                <Heading as="h3" size="md">{stockDetail.name} ({stockDetail.ticker})</Heading>
                                <Box p="4" bg={useColorModeValue("gray.100", "gray.800")} borderRadius="md" overflowX="auto" height="400px">
                                    <Bar data={placeholderData} options={chartOptions} ref={chartRef} />
                                </Box>
                                <Box p="4" bg={useColorModeValue("gray.100", "gray.800")} borderRadius="md" overflowX="auto" height="400px" mt="4">
                                    <Bar data={placeholderData} options={chartOptions} ref={chartRef} />
                                </Box>
                            </Box>
                        )}
                    </Flex>
                </Flex>
            </Flex>
        </AuthRequired>
    );
};

ChartsPage.getLayout = (page) => <AdminLayout>{page}</AdminLayout>;

export default ChartsPage;