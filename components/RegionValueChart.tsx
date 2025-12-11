import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { OpportunityRecord } from '../types';

interface RegionValueChartProps {
  data: OpportunityRecord[];
}

const RegionValueChart: React.FC<RegionValueChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    const regionValues: { [key: string]: number } = {};
    data.forEach(record => {
      const region = record.regionL3Desc || "Unknown";
      if (!regionValues[region]) {
        regionValues[region] = 0;
      }
      regionValues[region] += record.total;
    });

    return Object.entries(regionValues)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-700 p-2 border border-slate-600 rounded-md shadow-lg">
          <p className="label text-white font-bold">{`${label}`}</p>
          <p className="intro text-cyan-400">{`Total Value : ${payload[0].value.toLocaleString(undefined, {style: 'currency', currency: 'USD', maximumFractionDigits: 0})}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
        <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis 
          stroke="#94a3b8" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false}
          tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(value as number)}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(71, 85, 105, 0.5)' }}/>
        <Bar dataKey="value" fill="#22d3ee" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default RegionValueChart;