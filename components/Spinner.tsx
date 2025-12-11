
import React from 'react';

interface SpinnerProps {
  message?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-slate-800/50 rounded-xl">
      <div className="w-12 h-12 border-4 border-t-cyan-400 border-r-cyan-400 border-b-slate-600 border-l-slate-600 rounded-full animate-spin"></div>
      {message && <p className="mt-4 text-slate-300">{message}</p>}
    </div>
  );
};

export default Spinner;
