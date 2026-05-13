import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Download, 
  Trash2, 
  Search, 
  Filter, 
  Maximize2, 
  FileText, 
  Image as ImageIcon,
  Loader2,
  ShieldAlert,
  Activity
} from 'lucide-react';
import { 
  uploadFile, 
  saveVaultAsset, 
  getVaultAssets, 
  deleteVaultAsset, 
  handleForceDownload,
  VaultAsset 
} from '../services/database';
import { FirebaseUser } from '../firebase';
import { UserProfile } from '../types';
import toast from 'react-hot-toast';

interface MediaVaultProps {
  currentUser: FirebaseUser;
  profile: UserProfile | null;
  projectId?: string;
}

export default function MediaVault({ currentUser, profile, projectId }: MediaVaultProps) {
  const [assets, setAssets] = useState<VaultAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'image' | 'file'>('all');
  const [selectedAsset, setSelectedAsset] = useState<VaultAsset | null>(null);
  const [uploadError, setUploadError] = useState(false);

  useEffect(() => {
    const unsub = getVaultAssets(setAssets, projectId);
    setIsLoading(false);
    return () => unsub?.();
  }, [projectId]);

  const onDrop = async (e: React.DragEvent | React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setUploadError(false);
    
    let file: File | null = null;
    if ('files' in e.target && e.target.files) {
      file = e.target.files[0];
    } else if ('dataTransfer' in e) {
      file = e.dataTransfer.files[0];
    }

    if (!file) return;

    // Optional validation: restrict non-images/non-docs if needed, 
    // but the user wants "WebbyLaunch" system to be professional
    
    setUploading(true);
    setUploadPercent(0);

    try {
      const url = await uploadFile(file, 'vault_assets', (percent) => setUploadPercent(percent));
      
      await saveVaultAsset({
        url,
        name: file.name,
        size: file.size,
        type: file.type.startsWith('image/') ? 'image' : 'file',
        uploadedBy: currentUser.uid,
        projectId: projectId
      });

      toast.success("Intelligence secured in vault.");
    } catch (error) {
      console.error("Vault injection failed:", error);
      setUploadError(true);
      toast.error("Security breach: Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const filteredAssets = assets.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || a.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-12">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="text-[#FFFF00]" size={16} />
            <span className="text-[10px] font-black text-[#FFFF00] uppercase tracking-[0.4em]">Proprietary Storage</span>
          </div>
          <h2 className="text-6xl font-black tracking-tighter text-white uppercase italic">Media Vault</h2>
          <p className="text-white/40 max-w-xl font-bold uppercase tracking-widest text-[10px]">
            High-security repository for project assets. Powered by Cloudinary & WebbyLaunch encryption.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#FFFF00] transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Query Assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-black uppercase italic tracking-tighter w-full sm:w-64 focus:outline-none focus:border-[#FFFF00] transition-all"
            />
          </div>
          
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
            {(['all', 'image', 'file'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeFilter === f ? 'bg-[#FFFF00] text-black shadow-lg shadow-[#FFFF00]/20' : 'text-white/40 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Upload Zone */}
      <motion.div 
        animate={uploadError ? { x: [0, -10, 10, -10, 10, 0], boxShadow: "0 0 40px rgba(239, 68, 68, 0.4)" } : {}}
        className={`relative h-[300px] rounded-[3rem] border-2 border-dashed flex flex-col items-center justify-center gap-6 transition-all group overflow-hidden ${
          uploadError ? 'border-red-500 bg-red-500/5' : 'border-[#FFFF00]/20 hover:border-[#FFFF00]/60 bg-white/5'
        }`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
      >
        {uploading && (
           <div className="absolute inset-x-0 top-0 h-1 bg-[#FFFF00]/10 overflow-hidden">
             <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${uploadPercent}%` }}
              className="h-full bg-[#FFFF00] shadow-[0_0_15px_#FFFF00]"
             />
           </div>
        )}

        <div className="w-20 h-20 rounded-full border-2 border-[#FFFF00]/20 flex items-center justify-center group-hover:scale-110 group-hover:border-[#FFFF00] transition-all duration-500 relative">
          <Upload className="text-[#FFFF00]" size={32} />
          {uploading && (
             <motion.div 
              animate={{ y: [-40, 40] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="absolute inset-y-0 w-full bg-[#FFFF00]/20 blur-xl pointer-events-none"
             />
          )}
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-2xl font-black text-white italic uppercase">Deploy New Asset</h3>
          <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-black">Drag intelligence here or <label className="text-[#FFFF00] cursor-pointer hover:underline"><input type="file" className="hidden" onChange={onDrop} />browse local systems</label></p>
        </div>

        {uploading && (
          <div className="flex items-center gap-3">
             <Loader2 className="animate-spin text-[#FFFF00]" size={16} />
             <span className="text-[10px] font-black text-[#FFFF00] uppercase tracking-widest">{uploadPercent}% Encrypted</span>
          </div>
        )}
      </motion.div>

      {/* Assets Grid */}
      {isLoading ? (
        <div className="py-32 flex justify-center">
          <Loader2 className="animate-spin text-[#FFFF00]" size={48} />
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="py-32 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
          <ShieldAlert className="mx-auto text-white/10 mb-6" size={48} />
          <h3 className="text-white/20 text-xl font-black uppercase italic tracking-tighter">No intelligence retrieved for this sector</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredAssets.map((asset) => (
              <motion.div
                key={asset.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 overflow-hidden hover:border-[#FFFF00]/50 transition-all duration-500"
              >
                {/* Media Preview */}
                <div className="aspect-square relative overflow-hidden bg-black/40">
                  {asset.type === 'image' ? (
                    <img 
                      src={asset.url} 
                      alt={asset.name}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                      <FileText className="text-[#FFFF00]/40 group-hover:text-[#FFFF00] transition-colors" size={48} />
                      <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Binary Data</span>
                    </div>
                  )}

                  {/* Scanning Animation line */}
                  <motion.div 
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-x-0 h-[1px] bg-[#FFFF00] shadow-[0_0_10px_#FFFF00] opacity-0 group-hover:opacity-40 pointer-events-none"
                  />

                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
                    <button 
                      onClick={() => handleForceDownload(asset.url, asset.name)}
                      className="w-48 py-4 bg-[#FFFF00] text-black rounded-2xl font-black uppercase italic text-xs flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#FFFF00]/20"
                    >
                      <Download size={16} />
                      Download Asset
                    </button>
                    {profile?.role === 'admin' && (
                      <button 
                         onClick={() => deleteVaultAsset(asset.id)}
                         className="p-4 bg-red-500/20 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-lg"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Footer Info */}
                <div className="p-6 space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-white font-bold truncate uppercase tracking-tighter italic flex-1">{asset.name}</p>
                    <span className="text-[10px] font-black text-[#FFFF00] uppercase tracking-widest bg-[#FFFF00]/10 px-2 py-1 rounded-md">
                      {asset.type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">
                    <span>{(asset.size / (1024 * 1024)).toFixed(2)} MB</span>
                    <span>Verified Intelligence</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
