import React from 'react';
import { OpportunityRecord, ActivityRecord, ActivityDetailRecord } from '../types';
import EmployeeDashboard from './EmployeeDashboard';
import ViewSelector from './ViewSelector';

interface DashboardProps {
  opportunityData: OpportunityRecord[];
  activityData: ActivityRecord[];
  activityDetailData: ActivityDetailRecord[];
  fileName: string;
  onReset: () => void;
  view: 'menu' | 'manager' | 'employee';
  onViewChange: (view: 'menu' | 'manager' | 'employee') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ opportunityData, activityData, activityDetailData, fileName, onReset, view, onViewChange }) => {

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Sales & Activity Dashboard</h2>
          <p className="text-sm text-slate-400">Displaying data from <span className="font-medium text-cyan-400">{fileName}</span></p>
        </div>
        <button
          onClick={onReset}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 w-full sm:w-auto"
        >
          Upload New File
        </button>
      </div>

      {/* Performance Section */}
      <hr className="border-slate-700 my-4" />
      
      {view === 'menu' && (activityData.length > 0 || activityDetailData.length > 0) && (
        <ViewSelector onViewSelect={onViewChange} />
      )}

      {view !== 'menu' && (
         <div className="flex flex-col gap-4">
            <div className="flex justify-start">
                <button
                onClick={() => onViewChange('menu')}
                className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
                >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Back to Menu
                </button>
            </div>
            <EmployeeDashboard
                mode={view}
                activityData={activityData}
                opportunityData={opportunityData}
                activityDetailData={activityDetailData}
            />
        </div>
      )}

      {activityData.length === 0 && activityDetailData.length === 0 && (
         <div className="bg-slate-800 p-4 sm:p-6 rounded-xl shadow-lg">
            <p className="text-center text-slate-400 py-8">No employee or manager data found in 'Actividades_2025' or 'Activities_2025_Details' sheets to analyze.</p>
        </div>
      )}
     
    </div>
  );
};

export default Dashboard;