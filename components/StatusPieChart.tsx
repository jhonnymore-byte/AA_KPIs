import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface StatusPieChartProps {
  statusData: { name: string; value: number }[];
}

const COLORS = ['#22d3ee', '#818cf8', '#f87171', '#fbbf24', '#a3e635', '#60a5fa'];

const StatusPieChart: React.FC<StatusPieChartProps> = ({ statusData }) => {
  if (!statusData || statusData.length === 0) {
    return <div className="flex items-center justify-center h-full text-slate-500">No status data available.</div>;
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-700 p-2 border border-slate-600 rounded-md shadow-lg">
          <p className="label text-white font-bold">{`${payload[0].name} : ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={statusData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          // Fix: Handle cases where 'percent' can be undefined to prevent a TypeScript error by using a typeof check.
          label={({ name, percent }) => `${name} ${(typeof percent === 'number' ? percent * 100 : 0).toFixed(0)}%`}
        >
          {statusData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default StatusPieChart;
