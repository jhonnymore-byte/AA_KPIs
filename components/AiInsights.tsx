
import React from 'react';

// Basic markdown-to-HTML converter for this component
const renderMarkdown = (text: string) => {
    let html = text;
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h4 class="text-md font-semibold text-slate-300 mt-3 mb-1">$1</h4>');
    html = html.replace(/^## (.*$)/gim, '<h3 class="text-lg font-semibold text-cyan-400 mt-4 mb-2">$1</h3>');
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // List items
    html = html.replace(/^\s*[-*] (.*$)/gim, '<li class="mb-1 ml-4" style="list-style-type: disc;">$1</li>');
    // Wrap lists
    html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
    return { __html: html };
};

interface AiInsightsProps {
  insights: string | null;
}

const AiInsights: React.FC<AiInsightsProps> = ({ insights }) => {
  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-lg h-full">
      <div className="flex items-center mb-4">
        <svg className="w-6 h-6 text-cyan-400 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <h3 className="text-xl font-semibold text-white">Gemini AI Insights</h3>
      </div>
      {insights ? (
        <div 
          className="prose prose-invert prose-sm text-slate-300"
          dangerouslySetInnerHTML={renderMarkdown(insights)}
        >
        </div>
      ) : (
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-700 rounded w-3/4"></div>
          <div className="h-3 bg-slate-700 rounded w-full"></div>
          <div className="h-3 bg-slate-700 rounded w-5/6"></div>
          <div className="h-4 bg-slate-700 rounded w-1/2 mt-4"></div>
          <div className="h-3 bg-slate-700 rounded w-full"></div>
        </div>
      )}
    </div>
  );
};

export default AiInsights;
