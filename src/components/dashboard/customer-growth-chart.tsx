'use client';

import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { CustomerGrowth } from '@/services/dashboard-service';
import { Spinner } from '../ui/spinner';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface CustomerGrowthChartProps {
  data: CustomerGrowth[];
  isLoading: boolean;
}

export function CustomerGrowthChart({ data, isLoading }: CustomerGrowthChartProps) {
  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Spinner />
        <span className="ml-2 text-sm text-gray-500">Loading customer growth data...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No customer growth data available
      </div>
    );
  }

  const chartData = {
    labels: data.map(item => item.month),
    datasets: [
      {
        label: 'Total Customers',
        data: data.map(item => item.count),
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Customer Growth Over Time',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0 // Only show whole numbers
        }
      }
    }
  };

  return (
    <div className="h-64">
      <Line data={chartData} options={options} />
    </div>
  );
} 