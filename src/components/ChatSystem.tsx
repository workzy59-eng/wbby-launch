import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  X, 
  Check, 
  CheckCheck, 
  Image as ImageIcon, 
  Paperclip, 
  MoreVertical,
  Search,
  Phone,
  Video,
  MessageCircle,
  Trash2,
  Sparkles,
  Loader2,
  FileText,
  Download,
  Maximize2,
  File
} from 'lucide-react';
import { FirebaseUser, storage, ref, uploadBytesResumable, getDownloadURL } from '../firebase';
import { UserProfile, Message, Attachment } from '../types';
import { 
  sendMessage, 
  updateMessage, 
  getMessages, 
  getDirectMessages, 
  sendDirectMessage, 
  updateDirectMessage, 
  deleteMessage, 
  deleteDirectMessage 
} from '../services/database';
import { formatDate } from '../lib/utils';
import { HYPHENATED_NAME } from '../constants';
import { generateAIImageFromMessage } from '../services/geminiService';
import imageCompression from 'browser-image-compression';

interface ChatSystemProps {
  projectId?: string;
  isDirect?: boolean;
  recipientUser?: FirebaseUser | { uid: string; displayName: string };
  profile: UserProfile | null;
  currentUser: FirebaseUser;
  onClose?: () => void;
  user?: FirebaseUser | null;
}

interface UploadProgress {
  [fileName: string]: number;
}

export default function ChatSystem({ projectId, isDirect, recipientUser, profile, currentUser, onClose, user }: ChatSystemProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const notificationSound = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    notificationSound.current = new Audio('/notification.mp3');
  }, []);

  useEffect(() => {
    let unsubscribe: () => void;

    if (isDirect && recipientUser) {
      unsubscribe = getDirectMessages(recipientUser.uid, (messagesData) => {
        const filtered = (messagesData as any[]).filter(m => !m.hiddenFor?.includes(currentUser.uid));
        setMessages(filtered as Message[]);
        
        // Mark as seen
        messagesData.forEach(async (m) => {
          if (m.senderId !== currentUser.uid && !m.seen) {
            await updateDirectMessage(recipientUser.uid, m.id, { seen: true });
            notificationSound.current?.play().catch(() => {});
          }
        });
      });
    } else if (projectId) {
      unsubscribe = getMessages(projectId, (messagesData) => {
        const filtered = (messagesData as any[]).filter(m => !m.hiddenFor?.includes(currentUser.uid));
        setMessages(filtered as Message[]);
        
        // Mark as seen
        messagesData.forEach(async (m) => {
          if (m.senderId !== currentUser.uid && !m.seen) {
            await updateMessage(projectId, m.id, { seen: true });
            notificationSound.current?.play().catch(() => {});
          }
        });
      });
    }

    return () => unsubscribe?.();
  }, [projectId, isDirect, recipientUser?.uid, currentUser.uid]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    setIsSending(true);
    try {
      if (isDirect && recipientUser) {
        await sendDirectMessage(recipientUser.uid, {
          senderId: currentUser.uid,
          senderName: currentUser.displayName || profile?.displayName || 'User',
          text: inputText,
        });
      } else if (projectId) {
        await sendMessage(projectId, {
          senderId: currentUser.uid,
          senderName: currentUser.displayName || profile?.displayName || 'User',
          text: inputText,
        });
      }
      setInputText('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleFileUpload = async (files: FileList | null, isImage: boolean) => {
    if (!files || files.length === 0) return;
    
    setIsSending(true);
    const attachments: Attachment[] = [];
    
    try {
      for (let i = 0; i < files.length; i++) {
        let file = files[i];
        const fileName = `${Date.now()}_${file.name}`;
        
        // Validate size
        const maxSize = isImage ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
        if (file.size > maxSize) {
          alert(`File ${file.name} is too large. Max size is ${isImage ? '5MB' : '10MB'}.`);
          continue;
        }

        // Compress image if needed
        if (isImage) {
          const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true
          };
          try {
            file = await imageCompression(file as any, options) as any;
          } catch (error) {
            console.error('Compression failed:', error);
          }
        }

        const storageRef = ref(storage, `${isImage ? 'images' : 'attachments'}/${projectId || 'direct'}/${fileName}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        await new Promise<void>((resolve, reject) => {
          uploadTask.on('state_changed', 
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
            }, 
            (error) => reject(error), 
            async () => {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              attachments.push({
                name: file.name,
                type: file.type,
                url: url,
                size: file.size
              });
              setUploadProgress(prev => {
                const next = { ...prev };
                delete next[file.name];
                return next;
              });
              resolve();
            }
          );
        });
      }

      if (attachments.length > 0) {
        const messageData = {
          senderId: currentUser.uid,
          senderName: currentUser.displayName || profile?.displayName || 'User',
          text: isImage ? 'Sent images' : 'Sent attachments',
          attachments
        };

        if (isDirect && recipientUser) {
          await sendDirectMessage(recipientUser.uid, messageData);
        } else if (projectId) {
          await sendMessage(projectId, messageData);
        }
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsSending(false);
      setUploadProgress({});
    }
  };

  const handleDelete = async (forEveryone: boolean) => {
    if (!selectedMessage) return;

    try {
      if (isDirect) {
        await deleteDirectMessage(recipientUser.uid, selectedMessage.id, forEveryone, currentUser.uid);
      } else if (projectId) {
        await deleteMessage(projectId, selectedMessage.id, forEveryone, currentUser.uid);
      }
      setSelectedMessage(null);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleGenerateAI = async (message: Message) => {
    if (isGenerating) return;
    setIsGenerating(message.id);
    try {
      const imageUrl = await generateAIImageFromMessage(message.text);
      if (imageUrl) {
        if (isDirect && recipientUser) {
          await sendDirectMessage(recipientUser.uid, {
            senderId: currentUser.uid,
            senderName: currentUser.displayName || profile?.displayName || 'User',
            text: `AI Visualization for: "${message.text}"`,
            imageUrl
          });
        } else if (projectId) {
          await sendMessage(projectId, {
            senderId: currentUser.uid,
            senderName: currentUser.displayName || profile?.displayName || 'User',
            text: `AI Visualization for: "${message.text}"`,
            imageUrl
          });
        }
      }
    } catch (error) {
      console.error('Failed to generate AI image:', error);
    } finally {
      setIsGenerating(null);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex flex-col font-sans"
    >
      {/* Header */}
      <header className="px-10 py-8 border-b border-white/10 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-[#E6FF00] rounded-2xl flex items-center justify-center text-black font-black text-2xl italic shadow-[0_0_30px_rgba(230,255,0,0.2)]">
            {recipientUser?.displayName?.[0] || 'U'}
          </div>
          <div>
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">{recipientUser?.displayName || 'Project Chat'}</h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
              <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">Active Now</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-5 bg-white/5 border border-white/10 rounded-2xl text-white/40 hover:text-white transition-all">
            <Phone size={24} />
          </button>
          <button className="p-5 bg-white/5 border border-white/10 rounded-2xl text-white/40 hover:text-white transition-all">
            <Video size={24} />
          </button>
          <div className="w-[1px] h-12 bg-white/10 mx-4"></div>
          {onClose && (
            <button 
              onClick={onClose}
              className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 hover:bg-red-500 hover:text-white transition-all"
            >
              <X size={24} />
            </button>
          )}
        </div>
      </header>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-10 py-12 space-y-10 scrollbar-hide"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white/20 space-y-8">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center">
              <MessageCircle size={48} strokeWidth={1.5} className="text-[#E6FF00]" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm font-black uppercase tracking-[0.4em]">Secure Channel Established</p>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 italic">Messages are end-to-end encrypted</p>
            </div>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.senderId === currentUser.uid;
            return (
              <div 
                key={m.id} 
                className={`flex gap-6 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className="flex-shrink-0 mt-1">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black italic text-sm ${
                    isMe ? 'bg-[#E6FF00] text-black' : 'bg-white/10 text-white border border-white/10'
                  }`}>
                    {m.senderName?.[0] || 'U'}
                  </div>
                </div>

                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[70%]`}>
                  <motion.div 
                    layout
                    onClick={() => !m.isDeleted && setSelectedMessage(m)}
                    className={`p-6 rounded-[2.5rem] text-sm font-bold leading-relaxed shadow-2xl backdrop-blur-md border cursor-pointer transition-all ${
                      isMe 
                        ? 'bg-[#E6FF00] text-black border-[#E6FF00]/20 rounded-tr-none' 
                        : 'bg-white/5 text-white border-white/10 rounded-tl-none'
                    } ${m.isDeleted ? 'italic opacity-50 cursor-default' : ''}`}
                  >
                    {m.imageUrl && (
                      <div className="mb-4 rounded-2xl overflow-hidden border border-white/10 relative group">
                        <img src={m.imageUrl} alt="AI Visualization" className="w-full h-auto max-h-64 object-cover" />
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedImage(m.imageUrl!); }}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-white"
                        >
                          <Maximize2 size={24} />
                        </button>
                      </div>
                    )}

                    {m.attachments && m.attachments.length > 0 && (
                      <div className="space-y-3 mb-4">
                        {m.attachments.map((att, idx) => {
                          const isImg = att.type.startsWith('image/');
                          if (isImg) {
                            return (
                              <div key={idx} className="rounded-2xl overflow-hidden border border-white/10 relative group">
                                <img src={att.url} alt={att.name} className="w-full h-auto max-h-64 object-cover" />
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setSelectedImage(att.url); }}
                                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-white"
                                >
                                  <Maximize2 size={24} />
                                </button>
                              </div>
                            );
                          }
                          return (
                            <div key={idx} className={`flex items-center gap-4 p-4 rounded-2xl border ${isMe ? 'bg-black/10 border-black/10' : 'bg-white/5 border-white/10'}`}>
                              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white/60">
                                <FileText size={20} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-black truncate uppercase tracking-widest">{att.name}</p>
                                <p className="text-[10px] opacity-40 uppercase tracking-widest">{(att.size / 1024).toFixed(1)} KB</p>
                              </div>
                              <a 
                                href={att.url} 
                                download={att.name}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className={`p-2 rounded-lg transition-all ${isMe ? 'hover:bg-black/20' : 'hover:bg-white/10'}`}
                              >
                                <Download size={18} />
                              </a>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {m.text}
                    {!m.imageUrl && !isMe && !m.isDeleted && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGenerateAI(m);
                        }}
                        disabled={isGenerating === m.id}
                        className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#E6FF00] hover:opacity-80 transition-all"
                      >
                        {isGenerating === m.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Sparkles size={12} />
                        )}
                        {isGenerating === m.id ? 'Generating...' : 'Visualize with AI'}
                      </button>
                    )}
                  </motion.div>
                  <div className="flex items-center gap-3 mt-3 px-4">
                    <span className="text-[9px] text-white/30 font-black uppercase tracking-widest italic">
                      {m.createdAt ? formatDate(m.createdAt, 'h:mm a') : 'Sending...'}
                    </span>
                    {isMe && (
                      <span className="text-white/30">
                        {m.seen ? <CheckCheck size={14} className="text-blue-400" /> : <Check size={14} />}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Upload Progress Overlay */}
      <AnimatePresence>
        {Object.keys(uploadProgress).length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-[120]"
          >
            <div className="bg-[#4A5D4E] p-6 rounded-[2rem] border border-white/10 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-white">Uploading Files...</h4>
                <Loader2 size={16} className="animate-spin text-[#E6FF00]" />
              </div>
              <div className="space-y-3">
                {Object.entries(uploadProgress).map(([name, progress]) => (
                  <div key={name} className="space-y-1">
                    <div className="flex justify-between text-[8px] font-bold text-white/40 uppercase tracking-widest">
                      <span className="truncate max-w-[200px]">{name}</span>
                      <span>{progress.toFixed(0)}%</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-[#E6FF00]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-10 cursor-zoom-out"
          >
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={selectedImage} 
              alt="Full size" 
              className="max-w-full max-h-full object-contain rounded-3xl shadow-2xl"
            />
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-10 right-10 p-5 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all"
            >
              <X size={24} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Options Modal */}
      <AnimatePresence>
        {selectedMessage && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#4A5D4E] p-10 rounded-[3rem] border border-white/10 w-full max-w-sm shadow-2xl space-y-8"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Delete Message?</h3>
                <button onClick={() => setSelectedMessage(null)} className="text-white/40 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-4">
                {selectedMessage.senderId === currentUser.uid && (
                  <button 
                    onClick={() => handleDelete(true)}
                    className="w-full py-5 bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-all flex items-center justify-center gap-3"
                  >
                    <Trash2 size={18} /> Delete for everyone
                  </button>
                )}
                <button 
                  onClick={() => handleDelete(false)}
                  className="w-full py-5 bg-white/5 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                >
                  <Trash2 size={18} /> Delete for me
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <footer className="px-10 py-10 border-t border-white/10 bg-white/5">
        <form 
          onSubmit={handleSendMessage}
          className="max-w-5xl mx-auto flex items-center gap-6"
        >
          <div className="flex gap-3">
            <input 
              type="file" 
              id="chat-file-upload" 
              multiple
              className="hidden" 
              onChange={(e) => handleFileUpload(e.target.files, false)}
            />
            <label 
              htmlFor="chat-file-upload"
              className="p-5 bg-white/5 border border-white/10 rounded-2xl text-white/40 hover:text-white transition-all cursor-pointer"
            >
              <Paperclip size={24} />
            </label>

            <input 
              type="file" 
              id="chat-image-upload" 
              accept="image/*"
              multiple
              className="hidden" 
              onChange={(e) => handleFileUpload(e.target.files, true)}
            />
            <label 
              htmlFor="chat-image-upload"
              className="p-5 bg-white/5 border border-white/10 rounded-2xl text-white/40 hover:text-white transition-all cursor-pointer"
            >
              <ImageIcon size={24} />
            </label>
          </div>
          
          <div className="flex-1 relative">
            <input 
              type="text" 
              placeholder="Type your message here..."
              className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-10 py-6 text-white font-bold outline-none focus:border-[#E6FF00] transition-all"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            disabled={(!inputText.trim() && Object.keys(uploadProgress).length === 0) || isSending}
            className="p-6 bg-[#E6FF00] text-black rounded-2xl hover:scale-105 active:scale-95 disabled:opacity-50 transition-all shadow-[0_0_40px_rgba(230,255,0,0.3)]"
          >
            <Send size={28} />
          </button>
        </form>
      </footer>
    </motion.div>
  );
}
