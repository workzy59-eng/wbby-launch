import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, X, Check } from 'lucide-react';

interface FileDropZoneProps {
  onUpload: (files: File[]) => void;
  isUploading?: boolean;
}

export default function FileDropZone({ onUpload, isUploading }: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragover") {
      setIsDragging(true);
    } else {
      setIsDragging(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      onUpload(files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      onUpload(files);
    }
  };

  return (
    <div 
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      className={`relative w-full rounded-[2.5rem] p-10 transition-all duration-500 border-2 border-dashed flex flex-col items-center justify-center cursor-pointer group overflow-hidden ${
        isDragging 
          ? 'border-[#FFFF00] bg-[#FFFF00]/10 shadow-[0_0_40px_rgba(255,255,0,0.2)]' 
          : 'border-white/10 bg-white/5 backdrop-blur-md hover:border-white/30'
      }`}
      onClick={() => document.getElementById('chat-file-upload')?.click()}
    >
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,#FFFF00_25%,transparent_25%,transparent_75%,#FFFF00_75%,#FFFF00_100%),linear-gradient(45deg,#FFFF00_25%,transparent_25%,transparent_75%,#FFFF00_75%,#FFFF00_100%)] bg-[length:20px_20px] bg-[position:0_0,10px_10px]" />
      </div>

      <input 
        type="file" 
        id="chat-file-upload" 
        className="hidden" 
        multiple 
        onChange={handleFileInput}
      />

      <motion.div
        animate={isDragging ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className={`w-20 h-20 bg-black border-2 transition-all duration-500 relative flex items-center justify-center mb-6 ${isDragging ? 'border-[#FFFF00] shadow-[0_0_30px_rgba(255,255,0,0.4)] rotate-45' : 'border-white/20'}`}>
          <div className={isDragging ? '-rotate-45' : ''}>
            <Upload size={32} className={`${isDragging ? 'text-[#FFFF00] animate-bounce' : 'text-white/20'}`} />
          </div>
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#FFFF00]" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#FFFF00]" />
        </div>

        <h3 className={`text-2xl font-black italic uppercase tracking-tighter mb-2 transition-colors ${isDragging ? 'text-[#FFFF00]' : 'text-white'}`}>
          Secure Upload Channel
        </h3>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 group-hover:text-white/60 transition-colors">
          Drag & Drop Files or Click to Initialize
        </p>
      </motion.div>

      {/* Industrial side accents */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 w-1 h-12 bg-white/10 rounded-full" />
      <div className="absolute right-6 top-1/2 -translate-y-1/2 w-1 h-12 bg-white/10 rounded-full" />

      <AnimatePresence>
        {isUploading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center z-20"
          >
            <div className="w-12 h-12 border-4 border-[#FFFF00] border-t-transparent rounded-full animate-spin mb-4" />
            <span className="text-xs font-black uppercase tracking-widest text-[#FFFF00] animate-pulse">Syncing Data...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
