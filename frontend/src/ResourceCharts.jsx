import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import "./ResourceCharts.css";

const SERIES = [
  { key: "oxygen", label: "Oxygen", color: "#56c5ed" },
  { key: "water", label: "Water", color: "#399cf5" },
  { key: "food", label: "Food", color: "#e9a34c" },
  { key: "power", label: "Power", color: "#e8d15d" },
];

function ResourceCharts({ history }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  // Create the chart once
  useEffect(() => {
    chartRef.current = new Chart(canvasRef.current, {
      type: "line",
      data: {
        labels: [],
        datasets: SERIES.map((item) => ({
          label: item.label,
          data: [],
          borderColor: item.color,
          backgroundColor: item.color,
          borderWidth: 2,
          tension: 0.3,
          pointRadius: 3,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 300 },
        interaction: { mode: "index", intersect: false },
        scales: {
          y: {
            min: 0,
            max: 100,
            ticks: { color: "#a8b0b8", callback: (value) => `${value}%` },
            grid: { color: "rgba(255, 255, 255, 0.06)" },
          },
          x: {
            ticks: { color: "#a8b0b8" },
            grid: { display: false },
            title: { display: true, text: "Sol", color: "#a8b0b8" },
          },
        },
        plugins: {
          legend: { labels: { color: "#d5dbe1" } },
          tooltip: {
            callbacks: {
              label: (item) => `${item.dataset.label}: ${item.parsed.y}%`,
            },
          },
        },
      },
    });

    return () => chartRef.current.destroy();
  }, []);

  // Update the chart every time a new sol is added
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    chart.data.labels = history.map((entry) => entry.sol);
    SERIES.forEach((item, index) => {
      chart.data.datasets[index].data = history.map((entry) => entry[item.key]);
    });
    chart.update();
  }, [history]);

  return (
    <section className="rc-section">
      <div className="rc-card">
        <div className="rc-heading">
          <div>
            <p className="rc-tag">RESOURCE TRENDS</p>
            <h2>USAGE PER SOL</h2>
            <p className="rc-intro">
              Each line shows how much of the starting supply is left. Advance
              a sol or make a decision to update the chart.
            </p>
          </div>
          <span className="rc-count">{history.length} SOL(S) RECORDED</span>
        </div>

        <div className="rc-chart">
          <canvas ref={canvasRef}></canvas>
        </div>
      </div>
    </section>
  );
}

export default ResourceCharts;