import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface RunMetadata {
  id: string;
  datasetName: string;
  runTimestamp: Date;
  modelVersion: string;
  featureSet: string;
  recordCount: number;
  status: 'pending' | 'running' | 'completed' | 'error';
}

interface DataContextType {
  currentRun: RunMetadata | null;
  setCurrentRun: (run: RunMetadata | null) => void;
  runs: RunMetadata[];
  addRun: (run: RunMetadata) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Sample run data for demo
const sampleRun: RunMetadata = {
  id: 'run-001',
  datasetName: 'MEPS_2022_Sample.csv',
  runTimestamp: new Date('2024-12-10T14:30:00'),
  modelVersion: 'v2.3.1-stable',
  featureSet: 'Reduced Behavior-First',
  recordCount: 12847,
  status: 'completed'
};

export function DataProvider({ children }: { children: ReactNode }) {
  const [currentRun, setCurrentRun] = useState<RunMetadata | null>(sampleRun);
  const [runs, setRuns] = useState<RunMetadata[]>([sampleRun]);

  const addRun = (run: RunMetadata) => {
    setRuns(prev => [run, ...prev]);
    setCurrentRun(run);
  };

  return (
    <DataContext.Provider value={{ currentRun, setCurrentRun, runs, addRun }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
