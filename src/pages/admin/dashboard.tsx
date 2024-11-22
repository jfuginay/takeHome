import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Chart } from "react-chartjs-2";
import { useRef, useEffect } from "react";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
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

  const chartData = {
    labels: ["Stock A", "Stock B", "Stock C"],
    datasets: [
      {
        label: "Close Price",
        data: [150, 200, 250],
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
    <div style={{ height: "400px" }}>
      <Chart
        type="bar"
        data={chartData}
        options={chartOptions}
        ref={(ref) => {
          // Access the Chart.js instance directly
          if (ref) {
            chartRef.current = ref as unknown as ChartJS; // Cast ref to ChartJS instance
          }
        }}
      />
    </div>
  );
};

export default Dashboard;
