'use client';

import { createContext, useContext, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';

export type UploadStage = 'idle' | 'uploading' | 'processing' | 'completed' | 'failed';
export type LayoutMode = 'fixed' | 'flow';

export type FileJobState = {
  fileName: string;
  stage: UploadStage;
  message: string;
};

type UploadStateValue = {
  files: File[];
  setFiles: Dispatch<SetStateAction<File[]>>;
  message: string;
  setMessage: Dispatch<SetStateAction<string>>;
  isBusy: boolean;
  setIsBusy: Dispatch<SetStateAction<boolean>>;
  stage: UploadStage;
  setStage: Dispatch<SetStateAction<UploadStage>>;
  fileStatuses: FileJobState[];
  setFileStatuses: Dispatch<SetStateAction<FileJobState[]>>;
  layoutMode: LayoutMode;
  setLayoutMode: Dispatch<SetStateAction<LayoutMode>>;
};

const UploadStateContext = createContext<UploadStateValue | null>(null);

// Lives in the root layout, which never unmounts on client-side navigation,
// so an in-progress selection/upload survives switching pages and back.
export function UploadStateProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<File[]>([]);
  const [message, setMessage] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [stage, setStage] = useState<UploadStage>('idle');
  const [fileStatuses, setFileStatuses] = useState<FileJobState[]>([]);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('fixed');

  const value = useMemo<UploadStateValue>(
    () => ({ files, setFiles, message, setMessage, isBusy, setIsBusy, stage, setStage, fileStatuses, setFileStatuses, layoutMode, setLayoutMode }),
    [files, message, isBusy, stage, fileStatuses, layoutMode]
  );

  return <UploadStateContext.Provider value={value}>{children}</UploadStateContext.Provider>;
}

export function useUploadState() {
  const context = useContext(UploadStateContext);
  if (!context) {
    throw new Error('useUploadState must be used within UploadStateProvider');
  }

  return context;
}
