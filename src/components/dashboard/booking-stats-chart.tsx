'use client';

import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { BookingStat } from '@/services/dashboard-service';
import { Spinner } from '../ui/spinner';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BookingStatsChartProps {
  data: BookingStat[];
  isLoading: boolean;
}

export function BookingStatsChart({ data, isLoading }: BookingStatsChartProps) {
  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Spinner />
        <span className="ml-2 text-sm text-gray-500">Loading booking statistics...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No booking data available
      </div>
    );
  }

  const chartData = {
    labels: data.map(item => item.month),
    datasets: [
      {
        label: 'Bookings',
        data: data.map(item => item.count),
        backgroundColor: 'rgba(79, 70, 229, 0.7)',
        borderColor: 'rgba(79, 70, 229, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Bookings by Month',
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
      <Bar data={chartData} options={options} />
    </div>
  );
} 