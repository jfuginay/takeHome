import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

import { AdminLayout } from "~/components/Global/Layout";

export default function Dashboard() {
  interface ChartDataItem {
    date: string;
    totalSales: number;
    orderCount: number;
  }

  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const staticData: ChartDataItem[] = [
          { date: "2023-01", totalSales: 5000, orderCount: 150 },
          { date: "2023-02", totalSales: 7000, orderCount: 180 },
          { date: "2023-03", totalSales: 6200, orderCount: 170 },
          { date: "2023-04", totalSales: 8000, orderCount: 190 },
          { date: "2023-05", totalSales: 4500, orderCount: 140 },
          { date: "2023-06", totalSales: 5200, orderCount: 160 },
          { date: "2023-07", totalSales: 4800, orderCount: 155 },
          { date: "2023-08", totalSales: 6000, orderCount: 175 },
          { date: "2023-09", totalSales: 7000, orderCount: 200 },
          { date: "2023-10", totalSales: 7500, orderCount: 210 },
          { date: "2023-11", totalSales: 6200, orderCount: 180 },
          { date: "2023-12", totalSales: 8000, orderCount: 220 },
        ];
        setChartData(staticData);
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const data = {
    labels: chartData.map((item) => item.date),
    datasets: [
      {
        label: "Total Sales (USD)",
        data: chartData.map((item) => item.totalSales),
        backgroundColor: "#4CAF50", // Green bars
      },
      {
        label: "Order Count",
        data: chartData.map((item) => item.orderCount),
        backgroundColor: "#2196F3", // Blue bars
      },
    ],
  };

  const options: import("chart.js").ChartOptions<"bar"> = {
    indexAxis: "y", // Horizontal bar chart
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Monthly Sales and Order Performance (2023)",
      },
    },
  };

  if (loading) return <div className="w-full p-4">Loading...</div>;
  if (error) return <div className="w-full p-4 text-red-500">{error}</div>;


  return (
    <AdminLayout>
      <div className="w-full p-4">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <Bar data={data} options={options} />
      </div>
    </AdminLayout>
  );
}


