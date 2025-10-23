
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { UploadCloud, FileText, XCircle } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  acceptedFileTypes?: string;
  maxFileSize?: number; // in bytes
}

export function FileUpload({ onFileUpload, acceptedFileTypes = '.csv, .xls, .xlsx', maxFileSize = 5 * 1024 * 1024 }: FileUploadProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.size > maxFileSize) {
        setError(`O arquivo excede o tamanho máximo permitido de ${maxFileSize / (1024 * 1024)} MB.`);
        setFileName(null);
        return;
      }
      setFileName(file.name);
      onFileUpload(file);
    } else {
      setError('Nenhum arquivo selecionado ou tipo de arquivo inválido.');
      setFileName(null);
    }
  }, [onFileUpload, maxFileSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100',
        isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300',
        error ? 'border-red-500 bg-red-50' : ''
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center pt-5 pb-6">
        {fileName ? (
          <div className="flex items-center space-x-2 text-green-600">
            <FileText className="w-8 h-8" />
            <p className="text-lg font-medium">{fileName}</p>
          </div>
        ) : (
          <UploadCloud className="w-10 h-10 text-gray-400" />
        )}
        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
          <span className="font-semibold">Clique para fazer upload</span> ou arraste e solte
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {acceptedFileTypes} (MAX. {maxFileSize / (1024 * 1024)}MB)
        </p>
        {error && (
          <div className="flex items-center space-x-1 text-red-500 mt-2">
            <XCircle className="w-4 h-4" />
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}


