import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from 'lucide-react';

interface Props {
  images: Array<{ url: string; name: string }>;
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function Lightbox({ images, initialIndex = 0, isOpen, onClose }: Props) {
  const [index, setIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    setIndex(initialIndex);
    setZoom(1);
  }, [initialIndex, isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setIndex(i => (i > 0 ? i - 1 : images.length - 1));
      if (e.key === 'ArrowRight') setIndex(i => (i < images.length - 1 ? i + 1 : 0));
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, images.length, onClose]);

  if (!isOpen || !images.length) return null;
  const current = images[index];

  return (
    <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center" onClick={onClose}>
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <button onClick={(e) => { e.stopPropagation(); setZoom(z => Math.min(z + 0.5, 3)); }}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors">
          <ZoomIn className="w-5 h-5" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); setZoom(z => Math.max(z - 0.5, 0.5)); }}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors">
          <ZoomOut className="w-5 h-5" />
        </button>
        <a href={current.url} download={current.name} onClick={e => e.stopPropagation()}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors">
          <Download className="w-5 h-5" />
        </a>
        <button onClick={onClose}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Image */}
      <div className="flex items-center justify-center w-full h-full p-16" onClick={e => e.stopPropagation()}>
        <img
          src={current.url}
          alt={current.name}
          className="max-w-full max-h-full object-contain transition-transform duration-200"
          style={{ transform: `scale(${zoom})` }}
        />
      </div>

      {/* Navigation arrows */}
      {images.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); setIndex(i => (i > 0 ? i - 1 : images.length - 1)); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setIndex(i => (i < images.length - 1 ? i + 1 : 0)); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Counter + filename */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-sm bg-black/50 px-4 py-2 rounded-full">
        {index + 1} / {images.length} — {current.name}
      </div>
    </div>
  );
}
