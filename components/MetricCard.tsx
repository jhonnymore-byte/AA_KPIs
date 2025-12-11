
import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value }) => {
  return (
    <div className="bg-slate-800 p-4 rounded-xl shadow-lg text-center transition-transform hover:scale-105 duration-200">
      <h4 className="text-sm text-slate-400 font-medium">{title}</h4>
      <p className="text-3xl font-bold text-cyan-400 mt-2">{value}</p>
    </div>
  );
};

export default MetricCard;
