import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { OpportunityRecord } from '../types';

interface OwnerOppsChartProps {
  data: OpportunityRecord[];
}

const OwnerOppsChart: React.FC<OwnerOppsChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    const ownerOpps: { [key: string]: Set<string | number> } = {};

    data.forEach(record => {
      const owner = record.oppOwner || "Unassigned";
      if (!ownerOpps[owner]) {
        ownerOpps[owner] = new Set();
      }
      if (record.oppId) {
        ownerOpps[owner].add(record.oppId);
      }
    });

    return Object.entries(ownerOpps)
      .map(([name, opps]) => ({ name, opportunities: opps.size }))
      .sort((a, b) => b.opportunities - a.opportunities)
      .slice(0, 15); // Show top 15 for readability
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-700 p-2 border border-slate-600 rounded-md shadow-lg">
          <p className="label text-white font-bold">{`${label}`}</p>
          <p className="intro text-cyan-400">{`Opportunities : ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };
  
  if (chartData.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold mb-4 text-white">Unique Opportunities per Owner (Top 15)</h3>
        <div className="w-full h-96">
            <ResponsiveContainer width="100%" height="100%">
            <BarChart 
                data={chartData} 
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  width={150} 
                  tick={{ textAnchor: 'end' }}
                  interval={0}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(71, 85, 105, 0.5)' }}/>
                <Bar dataKey="opportunities" fill="#22d3ee" radius={[0, 4, 4, 0]} />
            </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
  );
};

export default OwnerOppsChart;