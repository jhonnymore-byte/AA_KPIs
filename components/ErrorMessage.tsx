
import React from 'react';

interface ErrorMessageProps {
  message: string;
  onClear: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onClear }) => {
  return (
    <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg relative flex justify-between items-center" role="alert">
      <div>
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{message}</span>
      </div>
      <button onClick={onClear} className="ml-4 p-1 text-red-300 hover:text-white">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
    </div>
  );
};

export default ErrorMessage;
