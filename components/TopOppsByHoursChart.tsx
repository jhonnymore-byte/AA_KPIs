

import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ActivityDetailRecord, ActivityRecord, OpportunityRecord } from '../types';

interface TopOppsByHoursChartProps {
  activityDetails: ActivityDetailRecord[];
  activityData: ActivityRecord[];
  opportunityData: OpportunityRecord[];
}

const TopOppsByHoursChart: React.FC<TopOppsByHoursChartProps> = ({ activityDetails, activityData, opportunityData }) => {
  const chartData = useMemo(() => {
    // Create lookup maps for performance
    const oppInfoMap = new Map<string | number, { description: string; acctName: string }>();
    activityData.forEach(act => {
      if (act.oppId && !oppInfoMap.has(act.oppId)) {
        oppInfoMap.set(act.oppId, { 
          description: act.oppDescription,
          acctName: act.acctName
        });
      }
    });

    const oppValueAndStatusMap = new Map<string | number, { total: number; status: string }>();
    opportunityData.forEach(opp => {
      if (opp.oppId) {
        oppValueAndStatusMap.set(opp.oppId, { 
            total: opp.total,
            status: opp.oppStatus || 'Unknown' 
        });
      }
    });

    // 1. Sum hours per Opp ID from the details data
    const hoursByOppId = new Map<string | number, number>();
    activityDetails.forEach(detail => {
      if (detail.oppId) {
        const currentHours = hoursByOppId.get(detail.oppId) || 0;
        hoursByOppId.set(detail.oppId, currentHours + detail.timeRecordedHours);
      }
    });

    // 2. Combine with description and value, sort
    return Array.from(hoursByOppId.entries())
      .map(([oppId, hours]) => {
        const info = oppInfoMap.get(oppId);
        const valueAndStatus = oppValueAndStatusMap.get(oppId);
        const acctName = info?.acctName || 'Unknown Account';
        const description = info?.description || `Opp ID: ${oppId}`;
        const displayName = `${acctName} - ${description}`;
        return {
          name: displayName, 
          oppId: oppId, 
          hours,
          acctName,
          description,
          totalValue: valueAndStatus?.total || 0,
          status: valueAndStatus?.status || 'N/A'
        };
      })
      .sort((a, b) => b.hours - a.hours);
  }, [activityDetails, activityData, opportunityData]);

  const CustomizedYAxisTick = (props: any) => {
    const { x, y, payload } = props;
    // Find the corresponding data point to check its status
    const dataPoint = chartData.find(d => d.name === payload.value);
    const status = dataPoint?.status.toLowerCase() || '';
    const isSuccess = status === 'won' || status === 'booked';
    
    // Truncate long labels
    const maxLength = 45;
    const truncatedValue = payload.value.length > maxLength 
      ? `${payload.value.substring(0, maxLength)}...` 
      : payload.value;

    return (
        <g transform={`translate(${x},${y})`}>
            <text x={0} y={0} dy={4} textAnchor="end" fill={isSuccess ? '#4ade80' : '#94a3b8'} fontSize={12}>
                {truncatedValue}
            </text>
        </g>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const status = data.status.toLowerCase();
      const isSuccess = status === 'won' || status === 'booked';
      return (
        <div className="bg-slate-700 p-3 border border-slate-600 rounded-md shadow-lg max-w-sm">
          <p className={`label font-bold text-md mb-2 ${isSuccess ? 'text-green-400' : 'text-white'}`}>{`Account: ${data.acctName}`}</p>
          <p className="text-slate-300 text-sm">{`Opp ID: ${data.oppId}`}</p>
          <p className="intro text-cyan-400 font-semibold mt-2">{`Total Hours: ${data.hours.toFixed(2)}`}</p>
          <p className="text-indigo-300 font-semibold">{`Value: ${data.totalValue.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}`}</p>
          <p className="text-slate-300 mt-2 text-sm">{`Description: ${data.description}`}</p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return <div className="flex items-center justify-center h-full text-slate-500">No opportunity hours data available to display.</div>;
  }

  const chartHeight = Math.max(300, chartData.length * 40); // 40px per bar, min height 300px

  return (
    <div className="w-full max-h-[600px] overflow-y-auto bg-slate-900/50 p-4 rounded-lg pr-8">
        <ResponsiveContainer width="100%" height={chartHeight}>
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
                    width={300} // Increased width for longer labels
                    tick={<CustomizedYAxisTick />}
                    interval={0}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(71, 85, 105, 0.5)' }} />
                <Bar dataKey="hours" name="Total Hours" fill="#818cf8" radius={[0, 4, 4, 0]} />
            </BarChart>
        </ResponsiveContainer>
    </div>
  );
};

export default TopOppsByHoursChart;