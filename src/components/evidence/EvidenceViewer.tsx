import { useState } from 'react';
import { Image as ImageIcon, FileText } from 'lucide-react';
import Lightbox from '@/components/ui/Lightbox';

interface EvidenceItem {
  file_url: string;
  file_name: string;
}

interface Props {
  evidence: EvidenceItem[];
}

export default function EvidenceViewer({ evidence }: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (!evidence.length) {
    return <span className="text-xs text-gray-400">Không có ảnh</span>;
  }

  const images = evidence.filter(e => !e.file_name.toLowerCase().endsWith('.pdf'));
  const pdfs = evidence.filter(e => e.file_name.toLowerCase().endsWith('.pdf'));

  return (
    <div>
      <div className="flex items-center gap-1 mb-2">
        <ImageIcon className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-xs text-gray-500 font-medium">{evidence.length} bằng chứng</span>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {images.map((img, i) => (
          <button key={i} onClick={() => { setLightboxIndex(i); setLightboxOpen(true); }}
            className="aspect-square rounded-lg overflow-hidden border border-gray-200 hover:ring-2 hover:ring-green-500 transition-all">
            <img src={img.file_url} alt={img.file_name} className="w-full h-full object-cover" />
          </button>
        ))}
        {pdfs.map((pdf, i) => (
          <a key={`pdf-${i}`} href={pdf.file_url} target="_blank" rel="noopener"
            className="aspect-square rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
            <FileText className="w-6 h-6 text-red-400" />
          </a>
        ))}
      </div>

      <Lightbox
        images={images.map(img => ({ url: img.file_url, name: img.file_name }))}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
}
