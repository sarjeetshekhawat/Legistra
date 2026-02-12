import React from 'react';
import { Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const RiskDistributionChart = ({ risks = [] }) => {
  // Count risks by severity
  const getRiskSeverity = (risk) => {
    const riskLower = risk.toLowerCase();
    const highKeywords = ['terminate', 'termination', 'liability', 'breach', 'penalty', 'indemnif', 'lawsuit', 'litigation', 'damages', 'void', 'illegal', 'unlawful', 'prohibit'];
    const mediumKeywords = ['may', 'could', 'should', 'recommend', 'suggest', 'consider', 'review', 'unclear', 'ambiguous', 'vague'];
    
    if (highKeywords.some(keyword => riskLower.includes(keyword))) return 'high';
    if (mediumKeywords.some(keyword => riskLower.includes(keyword))) return 'medium';
    return 'low';
  };

  const severityCounts = risks.reduce((acc, risk) => {
    const severity = getRiskSeverity(risk);
    acc[severity] = (acc[severity] || 0) + 1;
    return acc;
  }, {});

  const data = {
    labels: ['High Risk', 'Medium Risk', 'Low Risk'],
    datasets: [
      {
        label: 'Risk Distribution',
        data: [
          severityCounts.high || 0,
          severityCounts.medium || 0,
          severityCounts.low || 0
        ],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',   // red-500
          'rgba(251, 191, 36, 0.8)',  // amber-400
          'rgba(59, 130, 246, 0.8)'   // blue-500
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(59, 130, 246, 1)'
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 12,
            family: 'Inter, sans-serif'
          }
        }
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
        },
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  if (risks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>No risk data available</p>
      </div>
    );
  }

  return (
    <div className="h-64">
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default RiskDistributionChart;
