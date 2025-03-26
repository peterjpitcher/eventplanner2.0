'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { ChartData, ChartOptions } from 'chart.js';

// Dynamically import Chart.js components to avoid SSR issues
const Chart = dynamic(() => import('react-chartjs-2').then(mod => mod.Line), {
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center">Loading chart...</div>
});

const PieChart = dynamic(() => import('react-chartjs-2').then(mod => mod.Pie), {
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center">Loading chart...</div>
});

interface EventChartProps {
  type: 'line' | 'pie';
  data: ChartData<'line' | 'pie'>;
  options?: ChartOptions<'line' | 'pie'>;
}

export function EventChart({ type, data, options }: EventChartProps) {
  // Server-side rendering fallback
  if (typeof window === 'undefined') {
    return <div className="h-full w-full flex items-center justify-center">Loading chart...</div>;
  }

  const defaultOptions: ChartOptions<'line' | 'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  const chartOptions = { ...defaultOptions, ...options };

  if (type === 'pie') {
    return <PieChart data={data} options={chartOptions} />;
  }

  return <Chart data={data} options={chartOptions} />;
}

export function generateChartColors(count: number): string[] {
  const colors = [
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // yellow
    '#EF4444', // red
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#06B6D4', // cyan
    '#F97316', // orange
    '#84CC16', // lime
    '#6366F1', // indigo
  ];

  // If we need more colors than we have, generate them
  if (count > colors.length) {
    const additionalColors = Array.from({ length: count - colors.length }, (_, i) => {
      const hue = (i * 360) / (count - colors.length);
      return `hsl(${hue}, 70%, 50%)`;
    });
    return [...colors, ...additionalColors];
  }

  return colors.slice(0, count);
} 