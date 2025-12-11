import React, { useMemo } from 'react';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ActivityDetailRecord } from '../types';

interface HoursEvolutionChartProps {
  data: ActivityDetailRecord[];
}

const HoursEvolutionChart: React.FC<HoursEvolutionChartProps> = ({ data }) => {
    const chartData = useMemo(() => {
        if (!data || data.length === 0) {
            return [];
        }

        const monthlyTotals: { [key: string]: number } = {};
        
        data.forEach(record => {
            const date = new Date(record.activCreateDateUtc);
            if (!isNaN(date.getTime())) {
                const year = date.getFullYear();
                const month = date.getMonth(); // 0-11
                const key = `${year}-${String(month).padStart(2, '0')}`;
                
                monthlyTotals[key] = (monthlyTotals[key] || 0) + record.timeRecordedHours;
            }
        });

        const sortedMonths = Object.keys(monthlyTotals).sort();
        
        const processedData = sortedMonths.map((key, index) => {
             const [year, month] = key.split('-').map(Number);
             return {
                name: new Date(year, month).toLocaleString('default', { month: 'short' }),
                hours: monthlyTotals[key],
                index: index, // for regression
             }
        });

        if (processedData.length < 2) {
            // Not enough data points for a meaningful trend line
            return processedData;
        }

        // Linear Regression for trend line
        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        const n = processedData.length;

        processedData.forEach(p => {
            sumX += p.index;
            sumY += p.hours;
            sumXY += p.index * p.hours;
            sumX2 += p.index * p.index;
        });

        const denominator = (n * sumX2 - sumX * sumX);
        if (denominator === 0) {
          // Avoid division by zero, return data without trend
          return processedData;
        }
        
        const slope = (n * sumXY - sumX * sumY) / denominator;
        const intercept = (sumY - slope * sumX) / n;
        
        return processedData.map(p => ({
            ...p,
            trend: Math.max(0, slope * p.index + intercept) // Ensure trend doesn't go below zero
        }));

    }, [data]);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-700 p-2 border border-slate-600 rounded-md shadow-lg">
                    <p className="label text-white font-bold">{label}</p>
                    {payload.find(p => p.dataKey === 'hours') &&
                        <p className="intro text-cyan-400">{`Total Hours: ${payload.find(p => p.dataKey === 'hours').value.toFixed(2)}`}</p>
                    }
                </div>
            );
        }
        return null;
    };

    if (chartData.length === 0) {
      return <div className="flex items-center justify-center h-full text-slate-500">No time recording data available for this period.</div>;
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis 
                    dataKey="name" 
                    stroke="#94a3b8" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                />
                <YAxis 
                    stroke="#94a3b8" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    domain={[0, 'auto']}
                    label={{ value: 'Hours', angle: -90, position: 'insideLeft', fill: '#94a3b8', dy: 40 }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(71, 85, 105, 0.5)' }} />
                <Bar dataKey="hours" name="Monthly Hours" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                {chartData.some(d => d.trend !== undefined) && (
                  <Line 
                    type="monotone" 
                    dataKey="trend" 
                    stroke="#f43f5e" 
                    dot={false} 
                    strokeWidth={2} 
                    name="Trend"
                  />
                )}
            </ComposedChart>
        </ResponsiveContainer>
    );
};

export default HoursEvolutionChart;
