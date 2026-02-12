import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ClauseTypeChart = ({ clauses = [] }) => {
  // Count clauses by type
  const clauseCounts = clauses.reduce((acc, clause) => {
    const type = clause.type || 'Other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const labels = Object.keys(clauseCounts);
  const values = Object.values(clauseCounts);

  const data = {
    labels: labels.map(label => 
      label.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')
    ),
    datasets: [
      {
        label: 'Number of Clauses',
        data: values,
        backgroundColor: 'rgba(14, 165, 233, 0.8)', // primary-500
        borderColor: 'rgba(14, 165, 233, 1)',
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          family: 'Inter, sans-serif'
        },
        bodyFont: {
          size: 13,
          family: 'Inter, sans-serif'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: {
            family: 'Inter, sans-serif'
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        ticks: {
          font: {
            family: 'Inter, sans-serif'
          }
        },
        grid: {
          display: false
        }
      }
    }
  };

  if (clauses.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>No clause data available</p>
      </div>
    );
  }

  return (
    <div className="h-64">
      <Bar data={data} options={options} />
    </div>
  );
};

export default ClauseTypeChart;
