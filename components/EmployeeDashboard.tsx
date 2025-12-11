

import React, { useState, useMemo, useEffect } from 'react';
import { ActivityRecord, OpportunityRecord, ActivityDetailRecord } from '../types';
import MetricCard from './MetricCard';
import HoursEvolutionChart from './HoursEvolutionChart';
import TopOppsByHoursChart from './TopOppsByHoursChart';

interface EmployeeDashboardProps {
  activityData: ActivityRecord[];
  opportunityData: OpportunityRecord[];
  activityDetailData: ActivityDetailRecord[];
  mode: 'manager' | 'employee';
}

const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ activityData, opportunityData, activityDetailData, mode }) => {
  const [showDebugData, setShowDebugData] = useState(false);
  const [selectedManager, setSelectedManager] = useState<string>('All Managers');

  const adrmInfoByOppId = useMemo(() => {
    const map = new Map<string | number, { total: number; status: string }>();
    opportunityData.forEach(opp => {
      if (opp.oppId) {
        map.set(opp.oppId, { total: opp.total, status: opp.oppStatus || 'Unknown' });
      }
    });
    return map;
  }, [opportunityData]);

  const enrichedActivities = useMemo(() => {
    return activityData.map(activity => {
      const adrmInfo = adrmInfoByOppId.get(activity.oppId);
      return {
        ...activity,
        adrmTotalValue: adrmInfo?.total ?? 0,
        oppStatus: adrmInfo?.status ?? 'N/A',
      };
    });
  }, [activityData, adrmInfoByOppId]);

  const managerOptions = useMemo(() => {
    const managerSet = new Set<string>();
    activityData.forEach(act => {
        if (act.activTeamManagerName) managerSet.add(act.activTeamManagerName);
    });
    return ["All Managers", ...Array.from(managerSet).sort()];
  }, [activityData]);


  const { options, title } = useMemo(() => {
    if (mode === 'manager') {
      const managerSet = new Set<string>();
      enrichedActivities.forEach(act => {
        if (act.activTeamManagerName) managerSet.add(act.activTeamManagerName);
      });
      return { 
        options: Array.from(managerSet).sort(), 
        title: 'Manager Performance' 
      };
    }

    // mode === 'employee'
    let relevantActivities = enrichedActivities;
    if (selectedManager && selectedManager !== 'All Managers') {
        relevantActivities = enrichedActivities.filter(act => act.activTeamManagerName === selectedManager);
    }
    
    const employeeSet = new Set<string>();
    relevantActivities.forEach(act => {
        if (act.activTeamEmplName) employeeSet.add(act.activTeamEmplName);
    });

    if (!selectedManager || selectedManager === 'All Managers') {
        activityDetailData.forEach(detail => {
            if (detail.activTeamEmplName) employeeSet.add(detail.activTeamEmplName);
        });
    }
    
    return { 
      options: Array.from(employeeSet).sort(), 
      title: 'Employee Performance' 
    };
  }, [enrichedActivities, activityDetailData, mode, selectedManager]);

  const [selectedValue, setSelectedValue] = useState<string>('');

  useEffect(() => {
    // When the filtered options change (e.g., due to a manager filter change),
    // reset the selected value to the first available option.
    if (options.length > 0) {
      if (!selectedValue || !options.includes(selectedValue)) {
         setSelectedValue(options[0]);
      }
    } else {
      setSelectedValue('');
    }
  }, [options, selectedValue]);

  const filteredData = useMemo(() => {
    if (!selectedValue) return [];
    
    if (mode === 'manager') {
      return enrichedActivities.filter(d => d.activTeamManagerName === selectedValue);
    }
    
    return enrichedActivities.filter(d => d.activTeamEmplName === selectedValue);
  }, [enrichedActivities, selectedValue, mode]);

  const uniqueActivitiesForLog = useMemo(() => {
    if (!filteredData) return [];

    const seenOpps = new Set<string | number>();
    const uniqueActivities = filteredData.filter(activity => {
      if (seenOpps.has(activity.oppId)) {
        return false;
      } else {
        seenOpps.add(activity.oppId);
        return true;
      }
    });

    // Sort by Opp ACV (K USD) in descending order
    return uniqueActivities.sort((a, b) => b.oppAcvUsdK - a.oppAcvUsdK);
  }, [filteredData]);

  const filteredActivityDetails = useMemo(() => {
    if (!selectedValue || !activityDetailData) return [];

    if (mode === 'manager') {
      const managerEmployees = new Set<string>();
       enrichedActivities.forEach(act => {
        if (act.activTeamManagerName === selectedValue && act.activTeamEmplName) {
          managerEmployees.add(act.activTeamEmplName);
        }
      });
      return activityDetailData.filter(d => managerEmployees.has(d.activTeamEmplName));
    }
    
    return activityDetailData.filter(d => d.activTeamEmplName === selectedValue);
  }, [activityDetailData, enrichedActivities, selectedValue, mode]);

  const metrics = useMemo(() => {
    if (filteredData.length === 0) {
      return { uniqueOppsCount: 0, supportedPipeline: 0, bookedValue: 0, bookedOppsCount: 0, leanIXCount: 0 };
    }

    const uniqueOpps = new Map<string | number, { acv: number, adrmTotal: number, status: string }>();
    filteredData.forEach(activity => {
      if (activity.oppId && !uniqueOpps.has(activity.oppId)) {
        uniqueOpps.set(activity.oppId, {
          acv: activity.oppAcvUsdK,
          adrmTotal: activity.adrmTotalValue,
          status: activity.oppStatus,
        });
      }
    });
    
    const leanIXActivities = filteredData.filter(act => act.activInitiative === 'LeanIX');
    const uniqueLeanIXOpps = new Set(leanIXActivities.map(act => act.oppId));
    const leanIXOppsCount = uniqueLeanIXOpps.size;
    
    const oppsArray = Array.from(uniqueOpps.values());
    const supportedPipeline = oppsArray.reduce((sum, opp) => sum + opp.acv, 0);
    
    // --- KPI LOGIC REVIEW (as per user request) ---
    // Filter for unique opportunities with a status of 'Booked' or 'Won' (case-insensitive).
    const bookedOpps = oppsArray.filter(opp => opp.status.toLowerCase() === 'booked' || opp.status.toLowerCase() === 'won');
    
    // The 'Booked' KPI: Sums the total ADRM value of all unique 'Booked' or 'Won' opportunities.
    const bookedValue = bookedOpps.reduce((sum, opp) => sum + opp.adrmTotal, 0);
    
    // The '#Opp Booked' KPI: Counts the number of unique 'Booked' or 'Won' opportunities.
    const bookedOppsCount = bookedOpps.length;

    return {
      uniqueOppsCount: uniqueOpps.size,
      supportedPipeline,
      bookedValue,
      bookedOppsCount,
      leanIXCount: leanIXOppsCount
    };
  }, [filteredData]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  };
  
  const formatKiloValue = (value: number) => {
    if (value >= 1000) {
        return `$${(value / 1000).toFixed(1)}M`;
    }
    return `$${Math.round(value).toLocaleString()}K`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'won':
      case 'booked':
        return 'bg-green-200 text-green-800';
      case 'lost':
        return 'bg-red-200 text-red-800';
      default:
        return 'bg-slate-700 text-slate-300';
    }
  };

  return (
    <div className="bg-slate-800 p-4 sm:p-6 rounded-xl shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 flex-wrap">
        <h3 className="text-xl font-semibold text-white w-full sm:w-auto">{title}</h3>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          {mode === 'employee' && (
            <select
              value={selectedManager}
              onChange={(e) => setSelectedManager(e.target.value)}
              className="w-full sm:w-auto bg-slate-700 text-white border border-slate-600 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              aria-label="Filter by Manager"
            >
              {managerOptions.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          )}
          {options.length > 0 && (
            <select
              value={selectedValue}
              onChange={(e) => setSelectedValue(e.target.value)}
              className="w-full sm:w-64 bg-slate-700 text-white border border-slate-600 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              aria-label={`Select ${mode}`}
            >
              {options.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          )}
        </div>
      </div>


      {selectedValue ? (
        <div className="flex flex-col gap-6">
          {/* Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <MetricCard title="#OPP" value={metrics.uniqueOppsCount.toLocaleString()} />
            <MetricCard title="Supported Pipeline" value={formatKiloValue(metrics.supportedPipeline)} />
            <MetricCard title="Booked" value={formatCurrency(metrics.bookedValue)} />
            <MetricCard title="#Opp Booked" value={metrics.bookedOppsCount.toLocaleString()} />
            <MetricCard title="#OPP LeanIX supported" value={metrics.leanIXCount.toLocaleString()} />
          </div>

          {/* Activity Log Table */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Activity Log (From Actividades_2025)</h4>
            <div className="overflow-x-auto max-h-96">
              <table className="min-w-full divide-y divide-slate-700">
                <thead className="bg-slate-900 sticky top-0">
                  <tr>
                    {mode === 'manager' && <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Employee</th>}
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Opp ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Activ Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Acct Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Opp Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Opp. Total Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Opp Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Opp ACV (K USD)</th>
                  </tr>
                </thead>
                <tbody className="bg-slate-800 divide-y divide-slate-700">
                  {uniqueActivitiesForLog.map((row, index) => (
                    <tr key={`${row.activId}-${index}`} className="hover:bg-slate-700/50 transition-colors duration-150">
                      {mode === 'manager' && <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{row.activTeamEmplName}</td>}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{row.oppId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-300">{row.activType}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{row.acctName}</td>
                      <td className="px-6 py-4 whitespace-normal text-sm text-slate-400 max-w-xs">{row.oppDescription}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-cyan-400 font-semibold">{formatCurrency(row.adrmTotalValue)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(row.oppStatus)}`}>
                          {row.oppStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{row.oppAcvUsdK.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {uniqueActivitiesForLog.length === 0 && <p className="text-center py-4 text-slate-500">No unique opportunities found in the activity log for the selected {mode}.</p>}
            </div>
          </div>
          
          {filteredActivityDetails.length > 0 ? (
            <div className="mt-6">
               <h4 className="text-lg font-semibold mb-4 text-white">Cumulative Hours Evolution</h4>
                <div className="w-full h-96">
                   <HoursEvolutionChart data={filteredActivityDetails} />
                </div>
            </div>
          ) : (
            <p className="text-center py-4 text-slate-500 mt-4">No time recording data available for detailed chart analysis.</p>
          )}

          {filteredActivityDetails.length > 0 && (
             <div className="mt-6">
                <h4 className="text-lg font-semibold mb-4 text-white">Top Opportunities by Hours Recorded</h4>
                <TopOppsByHoursChart 
                  activityDetails={filteredActivityDetails} 
                  activityData={activityData} 
                  opportunityData={opportunityData}
                />
             </div>
          )}

          <div className="mt-6 text-right">
              <button onClick={() => setShowDebugData(!showDebugData)} className="text-sm text-slate-500 hover:text-slate-400">
                  {showDebugData ? 'Hide' : 'Show'} Raw Data
              </button>
          </div>
          
          {showDebugData && (
              <div className="mt-4 p-4 bg-slate-900/50 rounded-lg text-xs overflow-auto max-h-96">
                  <h4 className="font-bold text-slate-300">Filtered Activities ({filteredData.length})</h4>
                  <pre>{JSON.stringify(filteredData.slice(0, 10), null, 2)}</pre>
                  <h4 className="font-bold text-slate-300 mt-4">Filtered Activity Details ({filteredActivityDetails.length})</h4>
                  <pre>{JSON.stringify(filteredActivityDetails.slice(0, 10), null, 2)}</pre>
                  <h4 className="font-bold text-slate-300 mt-4">Metrics</h4>
                  <pre>{JSON.stringify(metrics, null, 2)}</pre>
              </div>
          )}
        </div>
      ) : (
        <p className="text-center text-slate-400 py-8">
            {options.length > 0 ? `Please select a ${mode} to view their performance details.` : `No ${mode} data found for the current filter.`}
        </p>
      )}
    </div>
  );
};

// Fix: Add default export to make the component available for import.
export default EmployeeDashboard;
