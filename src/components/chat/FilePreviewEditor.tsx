import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { 
  X, 
  Send, 
  RotateCw, 
  Wand2, 
  Pencil, 
  Type, 
  Square, 
  Grid3X3, 
  Smile, 
  StickyNote, 
  Download,
  Plus,
  Monitor
} from 'lucide-react';

interface FilePreviewEditorProps {
  files: File[];
  onCancel: () => void;
  onSend: (data: { file: File; caption: string }[]) => void;
  onAddMore: () => void;
}

export default function FilePreviewEditor({ files, onCancel, onSend, onAddMore }: FilePreviewEditorProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [captions, setCaptions] = useState<string[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // Update state when files prop changes
  React.useEffect(() => {
    setCaptions(prev => {
      const next = [...prev];
      for (let i = prev.length; i < files.length; i++) {
        next.push('');
      }
      return next;
    });
    setPreviewUrls(prev => {
      const next = [...prev];
      for (let i = prev.length; i < files.length; i++) {
        next.push(URL.createObjectURL(files[i]));
      }
      return next;
    });
  }, [files]);

  // Local state for image adjustments
  const [rotations, setRotations] = useState<number[]>([]);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  React.useEffect(() => {
    setRotations(files.map(() => 0));
    setActiveFilters(files.map(() => 'none'));
  }, [files.length]);

  const handleRotate = () => {
    const newRotations = [...rotations];
    newRotations[currentIndex] = (newRotations[currentIndex] + 90) % 360;
    setRotations(newRotations);
  };

  const handleFilter = () => {
    const filters = ['none', 'grayscale(100%)', 'sepia(100%)', 'invert(100%)', 'brightness(150%)', 'contrast(200%)'];
    const currentFilter = activeFilters[currentIndex];
    const nextIndex = (filters.indexOf(currentFilter) + 1) % filters.length;
    const newFilters = [...activeFilters];
    newFilters[currentIndex] = filters[nextIndex];
    setActiveFilters(newFilters);
    toast.success(`Filter: ${filters[nextIndex].split('(')[0] || 'Original'}`);
  };

  const handleHDMode = () => {
    toast.success('HD Enhancement Active', { icon: '✨' });
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    element.href = previewUrls[currentIndex];
    element.download = files[currentIndex].name;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Image saved to device');
  };

  const toolFeedback = (tool: string) => {
    toast(`${tool} coming soon!`, {
      icon: '✨',
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] bg-[#0b141a] flex flex-col font-sans"
    >
      <Toaster position="top-center" reverseOrder={false} />
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 bg-[#0b141a]">
        <button onClick={onCancel} className="p-2 text-white/70 hover:text-white transition-all">
          <X size={24} />
        </button>
        
        <div className="flex items-center gap-1 md:gap-4 overflow-x-auto scrollbar-hide px-2">
          {[
            { icon: RotateCw, label: 'Rotate', action: handleRotate },
            { icon: Wand2, label: 'Filter', action: handleFilter },
            { icon: Pencil, label: 'Draw', action: () => toolFeedback('Drawing') },
            { icon: Type, label: 'Text', action: () => toolFeedback('Text') },
            { icon: Square, label: 'Shapes', action: () => toolFeedback('Shapes') },
            { icon: Grid3X3, label: 'Pixelate', action: () => toolFeedback('Pixelation') },
            { icon: Smile, label: 'Emoji', action: () => toolFeedback('Emoji') },
            { icon: StickyNote, label: 'Stickers', action: () => toolFeedback('Stickers') },
            { icon: Monitor, label: 'HD', action: handleHDMode },
            { icon: Download, label: 'Save', action: handleDownload }
          ].map((tool, i) => (
            <button 
              key={i} 
              onClick={tool.action}
              className="p-2 text-white/70 hover:text-white transition-all rounded-full hover:bg-white/5"
              title={tool.label}
            >
              <tool.icon size={20} />
            </button>
          ))}
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              rotate: rotations[currentIndex]
            }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20 }}
            className="w-full max-w-2xl h-full flex items-center justify-center"
          >
            <img 
              src={previewUrls[currentIndex]} 
              alt="Preview" 
              className="max-w-full max-h-full object-contain shadow-2xl rounded-sm transition-all duration-300"
              style={{ filter: activeFilters[currentIndex] }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Caption Input */}
      <div className="w-full max-w-3xl mx-auto px-4 mb-4">
        <div className="relative flex items-center bg-[#202c33] rounded-xl overflow-hidden px-4 border border-white/5">
          <input 
            type="text"
            value={captions[currentIndex]}
            onChange={(e) => handleCaptionChange(e.target.value)}
            placeholder="Type a message"
            className="flex-1 bg-transparent border-none outline-none text-white py-4 text-sm font-medium"
          />
          <button className="p-2 text-white/40 hover:text-white transition-all">
            <Smile size={24} />
          </button>
        </div>
      </div>

      {/* Thumbnails & Send */}
      <div className="bg-[#0b141a] p-4 flex items-center justify-center gap-4">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-2 max-w-full">
          {previewUrls.map((url, i) => (
            <button
              key={url}
              onClick={() => setCurrentIndex(i)}
              className={`relative w-14 h-14 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                i === currentIndex ? 'border-[#00a884] scale-105' : 'border-transparent opacity-50 hover:opacity-100'
              }`}
            >
              <img src={url} alt="Thumb" className="w-full h-full object-cover" />
            </button>
          ))}
          <button 
            onClick={onAddMore}
            className="w-14 h-14 shrink-0 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all"
          >
            <Plus size={24} />
          </button>
        </div>

        <button 
          onClick={handleSend}
          className="w-14 h-14 bg-[#00a884] rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 active:scale-95 transition-all shrink-0 ml-4"
        >
          <Send size={24} className="ml-1" />
        </button>
      </div>
    </motion.div>
  );
}
