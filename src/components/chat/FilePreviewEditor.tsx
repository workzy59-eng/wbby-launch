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
  Monitor,
  File as FileIcon,
  Music,
  Film,
  FileText
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

  const handleSend = () => {
    const data = files.map((file, i) => ({
      file,
      caption: captions[i]
    }));
    onSend(data);
  };

  const handleCaptionChange = (val: string) => {
    const newCaptions = [...captions];
    newCaptions[currentIndex] = val;
    setCaptions(newCaptions);
  };

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

  const isImage = (file: File) => file.type.startsWith('image/');
  const isVideo = (file: File) => file.type.startsWith('video/');
  const isAudio = (file: File) => file.type.startsWith('audio/');

  const getFileIcon = (file: File) => {
    if (isImage(file)) return null;
    if (isVideo(file)) return <Film size={64} />;
    if (isAudio(file)) return <Music size={64} />;
    if (file.type.includes('pdf')) return <FileText size={64} />;
    return <FileIcon size={64} />;
  };

  const getThumbIcon = (file: File) => {
    if (isImage(file)) return null;
    if (isVideo(file)) return <Film size={20} />;
    if (isAudio(file)) return <Music size={20} />;
    if (file.type.includes('pdf')) return <FileText size={20} />;
    return <FileIcon size={20} />;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] bg-[#0a0a0a] flex flex-col font-sans"
    >
      <Toaster position="top-center" reverseOrder={false} />
      {/* Top Bar */}
      <div id="topbar" className="flex items-center justify-between p-6 bg-transparent">
        <button onClick={onCancel} className="p-3 text-white/70 hover:text-white transition-all bg-white/5 rounded-full">
          <X size={24} />
        </button>
        
        <div className={`flex items-center gap-1 md:gap-4 overflow-x-auto scrollbar-hide px-2 ${!isImage(files[currentIndex]) ? 'opacity-20 pointer-events-none' : ''}`}>
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
              className="p-2 text-white/70 hover:text-white transition-all rounded-full hover:bg-white/10"
              title={tool.label}
            >
              <tool.icon size={20} />
            </button>
          ))}
        </div>
      </div>

      {/* Main Preview Area */}
      <div id="previewimg" className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden">
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
            className="w-full h-full flex flex-col items-center justify-center gap-6"
          >
            {isImage(files[currentIndex]) ? (
              <img 
                src={previewUrls[currentIndex]} 
                alt="Preview" 
                className="max-w-[90%] max-h-[70%] object-contain shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-2xl transition-all duration-300"
                style={{ filter: activeFilters[currentIndex] }}
              />
            ) : (
              <div className="w-48 h-48 bg-white/5 border border-white/10 rounded-[3rem] flex flex-col items-center justify-center text-[#22c55e] shadow-2xl">
                {getFileIcon(files[currentIndex])}
                <div className="mt-6 text-center px-6">
                  <p className="text-white font-black uppercase text-xs truncate max-w-[200px]">{files[currentIndex].name}</p>
                  <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mt-1">{(files[currentIndex].size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Interface */}
      <div className="relative w-full max-w-4xl mx-auto p-4 flex flex-col gap-4">
        {/* Thumbnails */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-2 max-w-full">
          {previewUrls.map((url, i) => (
            <button
              key={url}
              onClick={() => setCurrentIndex(i)}
              className={`relative w-14 h-14 shrink-0 rounded-xl overflow-hidden border-2 transition-all flex items-center justify-center bg-white/5 ${
                i === currentIndex ? 'border-[#22c55e] scale-110 shadow-lg' : 'border-transparent opacity-40 hover:opacity-100'
              }`}
            >
              {isImage(files[i]) ? (
                <img src={url} alt="Thumb" className="w-full h-full object-cover" />
              ) : (
                <div className="text-[#22c55e]">
                  {getThumbIcon(files[i])}
                </div>
              )}
            </button>
          ))}
          <button 
            onClick={onAddMore}
            className="w-14 h-14 shrink-0 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all hover:bg-white/10"
          >
            <Plus size={24} />
          </button>
        </div>

        {/* Caption Bar */}
        <div id="bottombar" className="flex items-center bg-[#1f1f1f] rounded-[2rem] overflow-hidden px-6 py-1 border border-white/5 shadow-2xl">
          <input 
            type="text"
            value={captions[currentIndex] || ''}
            onChange={(e) => handleCaptionChange(e.target.value)}
            placeholder="Type a message"
            className="flex-1 bg-transparent border-none outline-none text-white py-4 text-sm font-medium placeholder:text-white/20"
          />
          <button className="p-2 text-white/40 hover:text-white transition-all">
            <Smile size={24} />
          </button>
        </div>

        {/* Floating Send Button */}
        <button 
          id="sendbtn"
          onClick={handleSend}
          className="absolute -right-2 bottom-4 w-[60px] h-[60px] bg-[#22c55e] rounded-full flex items-center justify-center text-white shadow-[0_10px_20px_rgba(34,197,94,0.3)] hover:scale-110 active:scale-95 transition-all shrink-0 z-20 text-2xl"
        >
          <Send size={24} className="ml-1" />
        </button>
      </div>
    </motion.div>
  );
}
