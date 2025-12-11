import React from 'react';

interface ViewSelectorProps {
  onViewSelect: (view: 'manager' | 'employee') => void;
}

const ViewSelector: React.FC<ViewSelectorProps> = ({ onViewSelect }) => {
  return (
    <div className="bg-slate-800 p-8 rounded-xl shadow-lg text-center">
      <h3 className="text-2xl font-semibold text-white mb-6">Select a Performance View</h3>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button
          onClick={() => onViewSelect('manager')}
          className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 text-lg w-full sm:w-auto"
        >
          Manager Performance
        </button>
        <button
          onClick={() => onViewSelect('employee')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 text-lg w-full sm:w-auto"
        >
          Employee Performance
        </button>
      </div>
    </div>
  );
};

export default ViewSelector;
