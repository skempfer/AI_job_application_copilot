import { useState, useRef } from 'react';
import { useLanguage } from '../../../../hooks/useLanguage';
import { trackEvent } from '../../../../lib/analytics';
import './ResumeUpload.css';

interface ResumeUploadProps {
  onUploadComplete?: (url: string) => void;
  disabled?: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export function ResumeUpload({ onUploadComplete, disabled = false }: ResumeUploadProps) {
  const { t } = useLanguage();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (file.type !== 'application/pdf') {
      return t('pdfOnlyError');
    }
    if (file.size > MAX_FILE_SIZE) {
      return t('fileSizeError');
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
        throw new Error(data.error || t('uploadError'));
      }

      if (!data.fileUrl) {
        throw new Error('Upload succeeded but no file URL returned');
      }

      setUploadedUrl(data.fileUrl);

      trackEvent('cv_uploaded', {
        file_size: file.size,
        file_type: file.type,
      });
      
      if (onUploadComplete) {
        onUploadComplete(data.fileUrl);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('uploadError');
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
    <div className="resume-upload">
      <label className="resume-upload__label">
        {t('cvUploadLabel')}
      </label>
      
      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled && !isUploading) {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        role="button"
        tabIndex={disabled || isUploading ? -1 : 0}
        aria-label="Upload resume file, drag and drop or click to select"
        aria-disabled={disabled || isUploading}
        className={[
          'resume-upload__dropzone',
          isDragging ? 'resume-upload__dropzone--dragging' : 'resume-upload__dropzone--default',
          (disabled || isUploading) ? 'resume-upload__dropzone--disabled' : '',
          uploadedUrl ? 'resume-upload__dropzone--success' : '',
        ].join(' ')}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          disabled={disabled || isUploading}
          className="resume-upload__input"
        />

        {isUploading ? (
          <div className="resume-upload__uploading">
            <div className="resume-upload__spinner-wrapper">
              <div className="resume-upload__spinner"></div>
            </div>
            <p className="resume-upload__uploading-text">{t('uploadingText')}</p>
          </div>
        ) : uploadedUrl ? (
          <div className="resume-upload__success">
            <div className="resume-upload__success-icon">✓</div>
            <p className="resume-upload__success-filename">
              {selectedFile?.name}
            </p>
            <p className="resume-upload__success-text">
              {t('uploadSuccess')}
            </p>
          </div>
        ) : (
          <div className="resume-upload__default">
            <div className="resume-upload__default-icon">📄</div>
            <p className="resume-upload__default-text">
              <span className="resume-upload__default-link">{t('clickToUpload')}</span>
              {' '}{t('orDragDrop')}
            </p>
            <p className="resume-upload__default-hint">
              {t('pdfOnlyMaxSize')}
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="resume-upload__error">
          <p className="resume-upload__error-text">
            {error}
          </p>
        </div>
      )}

      {!uploadedUrl && !error && (
        <p className="resume-upload__info">
          {t('uploadHint')}
        </p>
      )}
    </div>
  );
}
