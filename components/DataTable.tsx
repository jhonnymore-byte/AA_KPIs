
import React from 'react';
import { OpportunityRecord } from '../types';

interface DataTableProps {
  data: OpportunityRecord[];
}

const DataTable: React.FC<DataTableProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return null;
  }
  
  const headers = [
    'Opp ID', 'Company Name', 'Opp Owner', 'Opp Status', 'Region (L3)', 'Total Value'
  ];

  return (
    <div className="bg-slate-800 p-4 sm:p-6 rounded-xl shadow-lg">
      <h3 className="text-xl font-semibold mb-4 text-white">Raw Opportunity Data</h3>
      <div className="overflow-x-auto max-h-96">
        <table className="min-w-full divide-y divide-slate-700">
          <thead className="bg-slate-900 sticky top-0">
            <tr>
              {headers.map(header => (
                <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-slate-800 divide-y divide-slate-700">
            {data.slice(0, 100).map((row, index) => ( // Display up to 100 rows for performance
              <tr key={index} className="hover:bg-slate-700/50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{row.oppId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{row.companyName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{row.oppOwner}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${row.oppStatus === 'Won' ? 'bg-green-100 text-green-800' : 'bg-slate-700 text-slate-300'}`}>
                        {row.oppStatus}
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{row.regionL3Desc}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-cyan-400 font-semibold">{row.total.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length > 100 && <p className="text-center text-sm text-slate-500 mt-4">Showing first 100 of {data.length} records.</p>}
    </div>
  );
};

export default DataTable;
