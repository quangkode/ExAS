import { useState, useRef } from 'react';
import { Upload, Camera, X, Image as ImageIcon, FileText } from 'lucide-react';

interface UploadedFile {
  id: string;
  file_url: string;
  file_name: string;
  size: number;
  progress: number;
}

interface Props {
  files: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  required?: boolean;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

export default function EvidenceUploader({ files, onChange, maxFiles = 5, maxSizeMB = 10, required = false }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');

  const processFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    setError('');
    const remaining = maxFiles - files.length;
    if (remaining <= 0) {
      setError(`Tối đa ${maxFiles} tệp`);
      return;
    }

    const newFiles: UploadedFile[] = [];
    const maxBytes = maxSizeMB * 1024 * 1024;

    Array.from(fileList).slice(0, remaining).forEach(file => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError('Chỉ chấp nhận JPG, PNG, PDF');
        return;
      }
      if (file.size > maxBytes) {
        setError(`Tệp "${file.name}" vượt quá ${maxSizeMB}MB`);
        return;
      }
      // Simulate upload with picsum placeholder
      const id = `upload-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      newFiles.push({
        id,
        file_url: file.type === 'application/pdf'
          ? '#'
          : URL.createObjectURL(file),
        file_name: file.name,
        size: file.size,
        progress: 100,
      });
    });

    if (newFiles.length) {
      onChange([...files, ...newFiles]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    processFiles(e.dataTransfer.files);
  };

  const removeFile = (id: string) => {
    onChange(files.filter(f => f.id !== id));
  };

  const isPdf = (name: string) => name.toLowerCase().endsWith('.pdf');

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          dragOver
            ? 'border-green-500 bg-green-50'
            : 'border-gray-200 hover:border-green-400 hover:bg-green-50/50'
        }`}
      >
        <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-600 font-medium">Kéo thả tệp vào đây</p>
        <p className="text-xs text-gray-400 mt-1">JPG, PNG, PDF • Tối đa {maxSizeMB}MB/tệp • {maxFiles} tệp</p>

        <div className="flex items-center justify-center gap-2 mt-3">
          <button type="button"
            className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5" /> Chọn ảnh
          </button>
          <button type="button"
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5" /> Chụp ảnh
          </button>
        </div>

        <input ref={inputRef} type="file" multiple accept=".jpg,.jpeg,.png,.pdf"
          className="hidden" onChange={e => processFiles(e.target.files)} />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
      {required && files.length === 0 && <p className="text-xs text-amber-600">⚠️ Bắt buộc đính kèm bằng chứng</p>}

      {/* Thumbnails */}
      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {files.map(file => (
            <div key={file.id} className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
              {isPdf(file.file_name) ? (
                <div className="aspect-square flex items-center justify-center">
                  <FileText className="w-10 h-10 text-red-400" />
                </div>
              ) : (
                <img src={file.file_url} alt={file.file_name}
                  className="aspect-square object-cover w-full" />
              )}
              <button type="button" onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] px-2 py-1 truncate">
                {file.file_name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
