import React, { useState, useCallback } from 'react';
import { OpportunityRecord, ActivityRecord, ActivityDetailRecord } from './types';
import { parseExcelFile } from './services/excelParser';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';
import Spinner from './components/Spinner';
import ErrorMessage from './components/ErrorMessage';

const App: React.FC = () => {
  const [opportunityData, setOpportunityData] = useState<OpportunityRecord[] | null>(null);
  const [activityData, setActivityData] = useState<ActivityRecord[] | null>(null);
  const [activityDetailData, setActivityDetailData] = useState<ActivityDetailRecord[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [view, setView] = useState<'menu' | 'manager' | 'employee'>('menu');


  const handleFileUpload = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    setOpportunityData(null);
    setActivityData(null);
    setActivityDetailData(null);
    setFileName(file.name);
    setView('menu');

    try {
      setLoadingMessage('Parsing Excel file...');
      const { opportunityData: oppData, activityData: actData, activityDetailData: actDetData } = await parseExcelFile(file);
      
      setOpportunityData(oppData);
      setActivityData(actData);
      setActivityDetailData(actDetData);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      console.error(errorMessage);
      setError(`Failed to process file. ${errorMessage}`);
      setOpportunityData(null);
      setActivityData(null);
      setActivityDetailData(null);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, []);

  const handleReset = () => {
    setOpportunityData(null);
    setActivityData(null);
    setActivityDetailData(null);
    setError(null);
    setIsLoading(false);
    setFileName('');
    setView('menu');
  };

  const hasData = opportunityData || activityData || activityDetailData;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
            AI-Powered Sales & Activity Dashboard
          </h1>
          <p className="text-center text-slate-400 mt-2">
            Upload your Excel file to visualize 'ADRM' and 'Actividades_2025' sheets.
          </p>
        </header>

        <main>
          {isLoading && <Spinner message={loadingMessage} />}
          {error && <ErrorMessage message={error} onClear={() => setError(null)} />}
          
          {!isLoading && !hasData && <FileUpload onFileUpload={handleFileUpload} />}
          
          {!isLoading && hasData && (
            <Dashboard 
              opportunityData={opportunityData ?? []} 
              activityData={activityData ?? []}
              activityDetailData={activityDetailData ?? []}
              fileName={fileName}
              onReset={handleReset} 
              view={view}
              onViewChange={setView}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;