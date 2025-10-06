import React, { useState, useEffect } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { getDashboardStats } from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Visualizations = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getDashboardStats();
        setStats(response.data);
      } catch (err) {
        setError('Failed to load dashboard stats');
        console.error('Stats error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  const clauseData = {
    labels: ['Confidentiality', 'Termination', 'Liability', 'Payment', 'Intellectual Property', 'Other'],
    datasets: [{
      label: 'Clause Distribution',
      data: [15, 12, 8, 10, 6, 4], // TODO: Use real data from stats
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(107, 114, 128, 0.8)',
      ],
    }],
  };

  const riskData = {
    labels: ['Low Risk', 'Medium Risk', 'High Risk'],
    datasets: [{
      data: [45, 35, 20], // TODO: Use real data from stats.analysis_counts
      backgroundColor: [
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
      ],
    }],
  };

  const timelineData = {
    labels: stats.recent_uploads.map(doc => new Date(doc.upload_time).toLocaleDateString()),
    datasets: [{
      label: 'Recent Uploads',
      data: stats.recent_uploads.map((_, i) => i + 1), // Simple count
      borderColor: 'rgba(59, 130, 246, 1)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
    }],
  };

  const confidenceData = {
    labels: ['0.0-0.2', '0.2-0.4', '0.4-0.6', '0.6-0.8', '0.8-1.0'],
    datasets: [{
      label: 'Confidence Scores',
      data: [2, 5, 8, 15, 20], // TODO: Use real data
      backgroundColor: 'rgba(139, 92, 246, 0.8)',
    }],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Chart Title',
      },
    },
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Visualizations</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Clause Distribution */}
        <div className="card">
          <h3 className="text-lg font-medium mb-4">Clause Distribution</h3>
          <Bar
            data={clauseData}
            options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                title: { display: true, text: 'Clause Types Found' },
              },
            }}
          />
        </div>

        {/* Risk Assessment */}
        <div className="card">
          <h3 className="text-lg font-medium mb-4">Risk Assessment</h3>
          <Pie
            data={riskData}
            options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                title: { display: true, text: 'Risk Level Distribution' },
              },
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Processing Timeline */}
        <div className="card">
          <h3 className="text-lg font-medium mb-4">Document Processing Timeline</h3>
          <Line
            data={timelineData}
            options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                title: { display: true, text: 'Monthly Document Processing' },
              },
            }}
          />
        </div>

        {/* Confidence Scores */}
        <div className="card">
          <h3 className="text-lg font-medium mb-4">Confidence Score Distribution</h3>
          <Bar
            data={confidenceData}
            options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                title: { display: true, text: 'Model Confidence Ranges' },
              },
            }}
          />
        </div>
      </div>

      {/* Export Options */}
      <div className="mt-6 flex space-x-4">
        <button className="btn-secondary">Export as PNG</button>
        <button className="btn-secondary">Export as PDF</button>
      </div>
    </div>
  );
};

export default Visualizations;
