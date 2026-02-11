import { useState, useRef } from 'react';

interface ResumeUploadProps {
  onUploadComplete?: (url: string) => void;
  disabled?: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function ResumeUpload({ onUploadComplete, disabled = false }: ResumeUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (file.type !== 'application/pdf') {
      return 'Apenas arquivos PDF são permitidos';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'O arquivo deve ter no máximo 5MB';
    }
    return null;
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao fazer upload');
      }

      const url = data.fileUrl || data.fileName;
      setUploadedUrl(url);
      
      if (onUploadComplete && url) {
        onUploadComplete(url);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer upload';
      setError(errorMessage);
      setSelectedFile(null);
      setUploadedUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setError(null);
    
    await uploadFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
        CV Upload (Optional)
      </label>
      
      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-all duration-200
          ${isDragging 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
          ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : ''}
          ${uploadedUrl ? 'bg-green-50 dark:bg-green-900/10 border-green-300 dark:border-green-700' : 'bg-gray-50 dark:bg-gray-800'}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          disabled={disabled || isUploading}
          className="hidden"
        />

        {isUploading ? (
          <div className="space-y-2">
            <div className="flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Uploading...</p>
          </div>
        ) : uploadedUrl ? (
          <div className="space-y-2">
            <div className="text-green-600 dark:text-green-400 text-2xl">✓</div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {selectedFile?.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Upload successful • Click to replace
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-gray-400 dark:text-gray-500 text-3xl">📄</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium text-blue-600 dark:text-blue-400">Click to upload</span>
              {' '}or drag and drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              PDF only, max 5MB
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        </div>
      )}

      {!uploadedUrl && !error && (
        <p className="text-xs text-gray-500 dark:text-gray-400 italic">
          💡 Uploading your CV improves fit analysis accuracy.
        </p>
      )}
    </div>
  );
}
