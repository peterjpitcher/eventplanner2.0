'use client';

import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

interface EventChartProps {
  type: 'line' | 'pie';
  data: any;
  options?: any;
}

export function generateChartColors(count: number): string[] {
  const baseColors = [
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // yellow
    '#EF4444', // red
    '#8B5CF6', // purple
    '#EC4899', // pink
  ];

  if (count <= baseColors.length) {
    return baseColors.slice(0, count);
  }

  const colors = [...baseColors];
  const hueStep = 360 / count;

  for (let i = baseColors.length; i < count; i++) {
    const hue = (i * hueStep) % 360;
    colors.push(`hsl(${hue}, 70%, 50%)`);
  }

  return colors;
}

export function EventChart({ type, data, options }: EventChartProps) {
  const ChartComponent = type === 'line' ? Line : Pie;

  return (
    <div className="w-full h-full">
      <ChartComponent data={data} options={options} />
    </div>
  );
} 