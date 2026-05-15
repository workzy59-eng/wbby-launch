import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  X, 
  Check, 
  CheckCheck, 
  Image as ImageIcon, 
  Paperclip, 
  MoreVertical,
  Search,
  MessageCircle,
  Trash2,
  FileText,
  Maximize2,
  File,
  ExternalLink,
  ShieldCheck,
  Clock,
  CornerUpLeft,
  Edit
} from 'lucide-react';

const Loader = ({ color = "white" }: { color?: string }) => (
  <div className="flex items-center justify-center gap-2">
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={`w-6 h-6 border-2 border-${color === 'white' ? 'white' : '[#c7c42a]'} border-t-transparent rounded-full`}
    />
    <span className={`text-[10px] font-black uppercase tracking-[0.2em] text-${color === 'white' ? 'white' : '[#c7c42a]'} animate-pulse italic`}>Processing...</span>
  </div>
);
import { FirebaseUser } from '../firebase';
import { UserProfile, Message, Attachment } from '../types';
import { 
  sendMessage, 
  updateMessage, 
  getMessages, 
  getDirectMessages, 
  sendDirectMessage, 
  updateDirectMessage, 
  deleteMessage, 
  deleteDirectMessage,
  uploadFile,
  setUserTyping,
  getTypingStatus,
  getUserProfile,
  markMessageAsSeen,
  markMessageAsDelivered,
  deleteMessageForEveryone,
  getConversationId,
  markConversationAsSeen,
  markProjectAsSeen,
  searchUsers // Added
} from '../services/database';
import { formatDate } from '../lib/utils';
import { HYPHENATED_NAME } from '../constants';
import imageCompression from 'browser-image-compression';

import FilePreviewEditor from './chat/FilePreviewEditor';
import FileDropZone from './chat/FileDropZone';

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
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [recipientProfile, setRecipientProfile] = useState<UserProfile | null>(null);
  const [showInfoId, setShowInfoId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [showActions, setShowActions] = useState<string | null>(null);
  const [mentionSearch, setMentionSearch] = useState('');
  const [mentionResults, setMentionResults] = useState<UserProfile[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionLoading, setMentionLoading] = useState(false);
  const [mentions, setMentions] = useState<string[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  
  const [isHoveringDrop, setIsHoveringDrop] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const notificationSound = useRef<HTMLAudioElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    notificationSound.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
  }, []);

  useEffect(() => {
    let unsubscribe: () => void;
    let unsubTyping: () => void;

    const chatId = isDirect && recipientUser ? getConversationId(currentUser.uid, recipientUser.uid) : projectId;

    if (isDirect && recipientUser) {
      // Fetch recipient profile for status
      getUserProfile(recipientUser.uid).then(p => setRecipientProfile(p as UserProfile));

      unsubscribe = getDirectMessages(currentUser.uid, recipientUser.uid, (messagesData) => {
        const filtered = (messagesData as any[]).filter(m => !m.hiddenFor?.includes(currentUser.uid));
        setMessages(filtered as Message[]);
        
        // Mark conversation as seen
        if (chatId) markConversationAsSeen(chatId, currentUser.uid);
        
        // Mark individual messages as delivered and seen
        // Optimize: only update if status is not already seen/delivered
        messagesData.forEach(async (m) => {
          if (m.senderId !== currentUser.uid) {
            const isNew = m.status === 'sent';
            const isUnseen = m.status !== 'seen';

            if (isNew) {
              await markMessageAsDelivered(m.id, chatId);
            }
            if (isUnseen) {
              await markMessageAsSeen(m.id, chatId);
              notificationSound.current?.play().catch(() => {});
            }
          }
        });
      });

      if (chatId) {
        unsubTyping = getTypingStatus(chatId, (typing) => {
          setTypingUsers(typing.filter(uid => uid !== currentUser.uid));
        });
      }
    } else if (projectId) {
      unsubscribe = getMessages(projectId, (messagesData) => {
        const filtered = (messagesData as any[]).filter(m => !m.hiddenFor?.includes(currentUser.uid));
        setMessages(filtered as Message[]);
        
        // Mark project as seen
        markProjectAsSeen(projectId, currentUser.uid);
        
        // Mark individual messages as delivered and seen
        messagesData.forEach(async (m) => {
          if (m.senderId !== currentUser.uid) {
            const isNew = m.status === 'sent';
            const isUnseen = m.status !== 'seen';

            if (isNew) {
              await markMessageAsDelivered(m.id, undefined, projectId);
            }
            if (isUnseen) {
              await markMessageAsSeen(m.id, undefined, projectId);
              notificationSound.current?.play().catch(() => {});
            }
          }
        });
      });

      unsubTyping = getTypingStatus(projectId, (typing) => {
        setTypingUsers(typing.filter(uid => uid !== currentUser.uid));
      });
    }

    return () => {
      unsubscribe?.();
      unsubTyping?.();
    };
  }, [projectId, isDirect, recipientUser?.uid, currentUser.uid]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typingUsers]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && Object.keys(uploadProgress).length === 0) || isSending) return;

    setIsSending(true);
    const messageText = inputText.trim();
    const currentReplyingTo = replyingTo;
    const currentEditingMessage = editingMessage;
    const currentMentions = mentions;
    const chatId = isDirect && recipientUser ? (currentUser.uid < recipientUser.uid ? `${currentUser.uid}_${recipientUser.uid}` : `${recipientUser.uid}_${currentUser.uid}`) : projectId;

    try {
      if (isDirect && recipientUser) {
        if (currentEditingMessage) {
          await updateDirectMessage(recipientUser.uid, currentEditingMessage.id, {
            text: messageText,
            edited: true,
            mentions: currentMentions,
            updatedAt: new Date()
          });
          setEditingMessage(null);
        } else {
          await sendDirectMessage(recipientUser.uid, {
            senderId: currentUser.uid,
            senderName: currentUser.displayName || profile?.displayName || 'User',
            text: messageText,
            status: 'sent',
            type: 'text',
            mentions: currentMentions,
            replyTo: currentReplyingTo ? {
              id: currentReplyingTo.id,
              text: currentReplyingTo.text,
              senderName: currentReplyingTo.senderName
            } : null
          });
          setReplyingTo(null);
        }
      } else if (projectId) {
        if (currentEditingMessage) {
          await updateMessage(projectId, currentEditingMessage.id, {
            text: messageText,
            edited: true,
            mentions: currentMentions,
            updatedAt: new Date()
          });
          setEditingMessage(null);
        } else {
          await sendMessage(projectId, {
            senderId: currentUser.uid,
            senderName: currentUser.displayName || profile?.displayName || 'User',
            text: messageText,
            status: 'sent',
            type: 'text',
            mentions: currentMentions,
            replyTo: currentReplyingTo ? {
              id: currentReplyingTo.id,
              text: currentReplyingTo.text,
              senderName: currentReplyingTo.senderName
            } : null
          });
          setReplyingTo(null);
        }
      }
      setInputText('');
      setMentions([]);
      setShowMentions(false);
      if (chatId) {
        setUserTyping(chatId, currentUser.uid, false);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputText(value);
    
    const chatId = isDirect && recipientUser ? (currentUser.uid < recipientUser.uid ? `${currentUser.uid}_${recipientUser.uid}` : `${recipientUser.uid}_${currentUser.uid}`) : projectId;
    
    if (chatId) {
      setUserTyping(chatId, currentUser.uid, true);
      
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setUserTyping(chatId, currentUser.uid, false);
      }, 3000);
    }

    // Mention logic
    const words = value.split(' ');
    const lastWord = words[words.length - 1];
    
    if (lastWord.startsWith('@')) {
      const search = lastWord.substring(1);
      if (search.length >= 2) {
        setMentionSearch(search);
        setShowMentions(true);
        setMentionLoading(true);
        try {
          const results = await searchUsers(search);
          setMentionResults(results as UserProfile[]);
        } catch (err) {
          console.error('Mention search error:', err);
        } finally {
          setMentionLoading(false);
        }
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const selectMention = (user: UserProfile) => {
    const words = inputText.split(' ');
    words.pop(); // Remove the @mention part
    const mentionText = `@${user.username || user.displayName}`;
    const newText = [...words, mentionText].join(' ') + ' ';
    setInputText(newText);
    setMentions(prev => [...new Set([...prev, user.uid])]);
    setShowMentions(false);
  };

  const renderMedia = (m: Message) => {
    if (m.isDeleted) return null;
    
    const mediaUrl = m.mediaUrl || m.fileUrl || m.imageUrl || m.fileData;
    if (!mediaUrl) return null;

    if (m.type === 'image') {
      return (
        <div 
          className="relative group/media mb-2 rounded-2xl overflow-hidden border border-white/10 cursor-pointer bg-black/40 shadow-2xl transition-all hover:scale-[1.01]" 
          onClick={(e) => { e.stopPropagation(); setSelectedImage(mediaUrl); }}
        >
          <img src={mediaUrl} alt="Shared" className="max-w-full h-auto max-h-[400px] object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/media:opacity-100 transition-all flex items-center justify-center backdrop-blur-[2px]">
            <div className="p-3 bg-white/10 rounded-full backdrop-blur-md border border-white/20">
              <Maximize2 size={24} className="text-white drop-shadow-lg" />
            </div>
          </div>
        </div>
      );
    }

    if (m.type === 'video') {
      return (
        <div className="relative group/media mb-2 rounded-xl overflow-hidden border border-white/5 bg-black/20">
          <video src={mediaUrl} className="max-w-full h-auto max-h-[300px]" controls />
        </div>
      );
    }

    if (m.type === 'file') {
      const isMe = m.senderId === currentUser.uid;
      return (
        <div className={`flex items-center gap-3 p-3 rounded-xl border mb-2 ${isMe ? 'bg-black/10 border-black/5' : 'bg-white/5 border-white/10'}`}>
          <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-[#ffc107]">
            <FileText size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{m.fileName || 'Attachment'}</p>
            <p className="text-[10px] text-white/40 uppercase tracking-wider font-medium">Document</p>
          </div>
          <a 
            href={mediaUrl} 
            target="_blank" 
            rel="noreferrer" 
            className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/40 hover:text-white"
          >
            <ExternalLink size={18} />
          </a>
        </div>
      );
    }

    return null;
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || isSending) return;
    
    const fileList = Array.from(files);
    const images = fileList.filter(f => f.type.startsWith('image/'));
    const others = fileList.filter(f => !f.type.startsWith('image/'));

    if (images.length > 0) {
      setPendingFiles(prev => [...prev, ...images]);
    }

    if (others.length > 0) {
      // Direct upload for non-images
      uploadNonImages(others);
    }
  };

  const uploadNonImages = async (files: File[]) => {
    setIsSending(true);
    try {
      for (let file of files) {
        if (file.size > 10 * 1024 * 1024) {
          alert(`File ${file.name} is too large. Max 10MB.`);
          continue;
        }

        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
        
        try {
          const url = await uploadFile(file, 'uploads', (percent) => {
            setUploadProgress(prev => ({ ...prev, [file.name]: percent }));
          });
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));

          const messageData = {
            senderId: currentUser.uid,
            senderName: currentUser.displayName || profile?.displayName || 'User',
            text: `Shared ${file.name}`,
            type: 'file',
            mediaUrl: url,
            fileName: file.name
          };

          if (isDirect && recipientUser) {
            await sendDirectMessage(recipientUser.uid, messageData);
          } else if (projectId) {
            await sendMessage(projectId, messageData);
          }
        } catch (e) {
          console.error(e);
        }
      }
    } finally {
      setIsSending(false);
      setTimeout(() => setUploadProgress({}), 1000);
    }
  };

  const handleSendFromEditor = async (data: { file: File; caption: string }[]) => {
    setPendingFiles([]);
    setIsSending(true);
    
    try {
      for (let item of data) {
        let file = item.file;
        
        // Compress images
        try {
          file = await imageCompression(file as any, { maxSizeMB: 1, maxWidthOrHeight: 1920 }) as any;
        } catch (e) { console.error(e); }

        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
        
        try {
          const url = await uploadFile(file, 'uploads', (percent) => {
            setUploadProgress(prev => ({ ...prev, [file.name]: percent }));
          });
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));

          const messageData = {
            senderId: currentUser.uid,
            senderName: currentUser.displayName || profile?.displayName || 'User',
            text: item.caption || 'Sent an image',
            type: 'image',
            mediaUrl: url,
            fileName: file.name
          };

          if (isDirect && recipientUser) {
            await sendDirectMessage(recipientUser.uid, messageData);
          } else if (projectId) {
            await sendMessage(projectId, messageData);
          }
        } catch (e) {
          console.error(e);
        }
      }
    } finally {
      setIsSending(false);
      setTimeout(() => setUploadProgress({}), 1000);
    }
  };

  const handleDelete = async (forEveryone: boolean) => {
    if (!selectedMessage) return;

    try {
      if (isDirect && recipientUser) {
        await deleteDirectMessage(recipientUser.uid, selectedMessage.id, forEveryone, currentUser.uid);
      } else if (projectId) {
        await deleteMessage(projectId, selectedMessage.id, forEveryone, currentUser.uid);
      }
      setSelectedMessage(null);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex flex-col font-sans h-[100dvh]"
    >
      <AnimatePresence>
        {pendingFiles.length > 0 && (
          <FilePreviewEditor 
            files={pendingFiles}
            onCancel={() => setPendingFiles([])}
            onSend={handleSendFromEditor}
            onAddMore={() => fileInputRef.current?.click()}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="px-4 md:px-10 py-4 md:py-8 border-b border-white/10 flex items-center justify-between bg-white/5 shrink-0">
        <div className="flex items-center gap-3 md:gap-6">
          <div className="relative">
            <div className={`w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center text-black font-black text-lg md:text-2xl italic shadow-[0_0_30px_rgba(199,196,42,0.2)] ${recipientUser?.displayName === 'SAI ROSHAN' ? 'bg-transparent border border-[#c7c42a]/30 text-[#c7c42a]' : 'bg-[#c7c42a]'}`}>
              {recipientUser?.displayName === 'SAI ROSHAN' ? <ShieldCheck size={20} className="md:w-8 md:h-8" /> : (recipientUser?.displayName?.[0] || (projectId ? 'P' : 'U'))}
            </div>
            {isDirect && (
              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 md:w-5 md:h-5 border-2 md:border-4 border-black rounded-full ${
                recipientProfile?.status === 'online' ? 'bg-[#c7c42a]' : 
                recipientProfile?.status === 'away' ? 'bg-[#c7c42a]' : 'bg-gray-500'
              }`}></div>
            )}
          </div>
          <div>
            <h2 className="text-xl md:text-3xl font-black text-white uppercase italic tracking-tighter truncate max-w-[150px] md:max-w-none">{recipientUser?.displayName || (projectId ? 'Project Chat' : 'Chat')}</h2>
            <div className="flex items-center gap-2">
              {typingUsers.length > 0 ? (
                <p className="text-[10px] text-[#c7c42a] font-black uppercase tracking-widest animate-pulse italic">typing...</p>
              ) : (
                <>
                  <div className={`w-2 h-2 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)] ${
                    isDirect ? (recipientProfile?.status === 'online' ? 'bg-[#c7c42a]' : 'bg-gray-500') : 'bg-[#c7c42a]'
                  }`}></div>
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                    {isDirect ? (recipientProfile?.status === 'online' ? 'Active Now' : `Last seen ${recipientProfile?.lastSeen ? formatDate(recipientProfile.lastSeen, 'MMM d, h:mm a') : 'recently'}`) : 'Active Channel'}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="w-[1px] h-8 md:h-12 bg-white/10 mx-1 md:mx-4"></div>
          {onClose && (
            <button 
              onClick={onClose}
              className="p-3 md:p-5 bg-red-500/10 border border-red-500/20 rounded-xl md:rounded-2xl text-red-400 hover:bg-red-500 hover:text-white transition-all"
            >
              <X size={20} className="md:w-6 md:h-6" />
            </button>
          )}
        </div>
      </header>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        onDragOver={(e) => { e.preventDefault(); setIsHoveringDrop(true); }}
        className="flex-1 overflow-y-auto px-4 md:px-6 py-6 md:py-8 space-y-4 md:space-y-6 scrollbar-hide bg-[#rgba(255,255,255,0.05)] relative"
        style={{
          backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
          backgroundRepeat: 'repeat',
          backgroundSize: '400px',
          backgroundBlendMode: 'overlay',
          backgroundColor: '#rgba(255,255,255,0.05)'
        }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            <div className="w-24 h-24 bg-[#c7c42a]/10 rounded-full flex items-center justify-center relative">
              <MessageCircle size={48} className="text-[#c7c42a]" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">Secure Channel</h3>
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest max-w-[200px] leading-relaxed">
                Messages are end-to-end encrypted and secure.
              </p>
            </div>
          </div>
        ) : (
          messages.map((m, idx) => {
            const isMe = m.senderId === currentUser.uid;
            const showDate = idx === 0 || (m.createdAt && messages[idx - 1].createdAt && formatDate(m.createdAt, 'MMM d') !== formatDate(messages[idx - 1].createdAt, 'MMM d'));
            
            return (
              <React.Fragment key={m.id}>
                {showDate && (
                  <div className="flex justify-center my-8">
                    <div className="bg-[#rgba(255,255,255,0.05)]/50 backdrop-blur-md px-4 py-1.5 rounded-lg border border-white/5">
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
                        {formatDate(m.createdAt, 'MMMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                )}
                <div 
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                {!isMe && !isDirect && (
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1 ml-4 italic">
                    {m.senderName}
                  </span>
                )}
                <div className={`flex gap-3 max-w-[80%] md:max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'} group/msg-container`}>
                  <motion.div 
                    layout
                    onClick={() => {
                      if (m.isDeleted) return;
                      setShowInfoId(showInfoId === m.id ? null : m.id);
                    }}
                    className={`p-4 rounded-2xl text-sm font-bold leading-relaxed shadow-lg relative group cursor-pointer transition-all ${
                      isMe 
                        ? 'bg-[#c7c42a] text-black rounded-tr-none' 
                        : 'bg-[rgba(255,255,255,0.05)] text-white rounded-tl-none border border-white/5'
                    } ${m.isDeleted ? 'italic opacity-50 cursor-default' : ''}`}
                  >
                    {/* Message Actions Dropdown */}
                    <AnimatePresence>
                      {showActions === m.id && !m.isDeleted && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className={`absolute top-0 ${isMe ? 'right-full mr-2' : 'left-full ml-2'} z-10 flex items-center gap-1 bg-[#rgba(255,255,255,0.05)] p-1 rounded-xl border border-white/10 shadow-2xl`}
                        >
                          <button 
                            onClick={(e) => { e.stopPropagation(); setReplyingTo(m); }}
                            className="p-2 hover:bg-white/5 rounded-lg text-white/60 hover:text-[#c7c42a] transition-all"
                            title="Reply"
                          >
                            <CornerUpLeft size={16} />
                          </button>
                          {isMe && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingMessage(m);
                                setInputText(m.text);
                              }}
                              className="p-2 hover:bg-white/5 rounded-lg text-white/60 hover:text-[#c7c42a] transition-all"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                          )}
                          <button 
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (isDirect && recipientUser) {
                                await deleteDirectMessage(recipientUser.uid, m.id, isMe, currentUser.uid);
                              } else if (projectId) {
                                await deleteMessage(projectId, m.id, isMe, currentUser.uid);
                              }
                            }}
                            className="p-2 hover:bg-white/5 rounded-lg text-white/60 hover:text-red-400 transition-all"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {m.replyTo && (
                      <div className="mb-2 p-2 rounded-lg border-l-4 bg-black/20 border-[#c7c42a]">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">
                          {m.replyTo.senderName}
                        </p>
                        <p className="text-[10px] text-white/40 truncate italic">
                          {m.replyTo.text}
                        </p>
                      </div>
                    )}

                    {renderMedia(m)}

                    {!m.isDeleted && (
                      <div className="flex flex-col gap-1">
                        <div className="break-words">
                          {m.text.split(' ').map((word, i) => {
                            if (word.startsWith('@')) {
                              return <span key={i} className="text-[#34b7f1] font-bold cursor-pointer hover:underline">{word} </span>;
                            }
                            return word + ' ';
                          })}
                          {!m.isDeleted && m.edited && (
                            <span className="text-[8px] text-white/20 font-black uppercase tracking-widest ml-2 italic">
                              (edited)
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* AI Visualization button removed */}

                    <div className="flex items-center justify-end gap-1 mt-1 text-white/40">
                      <span className="text-[9px] font-bold uppercase tracking-tighter">
                        {formatDate(m.createdAt, 'h:mm a')}
                      </span>
                      {isMe && (
                        m.seen ? <CheckCheck size={12} className="text-[#c7c42a]" /> : <Check size={12} />
                      )}
                    </div>

                    <AnimatePresence>
                      {showInfoId === m.id && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-2 pt-2 border-t border-white/5 space-y-1 overflow-hidden"
                        >
                          <p className="text-[8px] font-black uppercase tracking-widest text-white/30">
                            Sent: {formatDate(m.createdAt, 'MMM d, h:mm:ss a')}
                          </p>
                          {m.seen && (
                            <p className="text-[8px] font-black uppercase tracking-widest text-#c7c42a">
                              Seen: {m.seenTime ? formatDate(m.seenTime, 'MMM d, h:mm:ss a') : 'Recently'}
                            </p>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
              </div>
            </React.Fragment>
          );
        })
      )}
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-3 text-[10px] text-[#c7c42a] font-black uppercase tracking-widest italic animate-pulse">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-[#c7c42a] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1.5 h-1.5 bg-[#c7c42a] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1.5 h-1.5 bg-[#c7c42a] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
            Someone is typing...
          </div>
        )}

        <AnimatePresence>
          {isHoveringDrop && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-black/80 backdrop-blur-3xl p-10 flex flex-col items-center justify-center"
              onDragLeave={() => setIsHoveringDrop(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsHoveringDrop(false);
                const files = e.dataTransfer.files;
                if (files.length > 0) handleFileUpload(files);
              }}
            >
              <FileDropZone 
                onUpload={(files) => {
                  setIsHoveringDrop(false);
                  const dt = new DataTransfer();
                  files.forEach(f => dt.items.add(f));
                  handleFileUpload(dt.files);
                }} 
              />
              <button 
                onClick={() => setIsHoveringDrop(false)}
                className="mt-6 text-[10px] font-black uppercase tracking-[0.5em] text-white/40 hover:text-white transition-colors"
              >
                Abort Upload
              </button>
            </motion.div>
          )}
        </AnimatePresence>
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
            <div className="bg-black/90 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-white">Uploading Files...</h4>
                <Loader color="white" />
              </div>
              <div className="space-y-4">
                {Object.entries(uploadProgress).map(([name, progress]) => (
                  <div key={name} className="space-y-2">
                    <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-[0.2em]">
                      <span className="text-white/40 truncate max-w-[200px] italic">{name}</span>
                      <span className="text-[#FFFF00]">{progress.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 border border-white/10 overflow-hidden relative">
                      <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${progress}%` }}
                         className="h-full bg-[#FFFF00] shadow-[0_0_15px_rgba(255,255,0,0.5)]"
                         transition={{ type: 'spring', damping: 20 }}
                       />
                       {/* Scanning line effect */}
                       <motion.div 
                         animate={{ x: ['-100%', '200%'] }}
                         transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                         className="absolute top-0 bottom-0 w-20 bg-gradient-to-r from-transparent via-[#FFFF00]/30 to-transparent"
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
              className="bg-black/90 backdrop-blur-xl p-10 rounded-[3rem] border border-white/10 w-full max-w-sm shadow-2xl space-y-8"
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
      <footer className="px-4 md:px-6 py-4 md:py-6 border-t border-white/10 bg-[#rgba(255,255,255,0.05)] relative shrink-0">
        {/* Reply/Edit Preview */}
        <AnimatePresence>
          {(replyingTo || editingMessage) && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full left-0 right-0 p-4 bg-[#1e293b] border-t border-white/10 flex items-center justify-between"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={`w-1 h-10 rounded-full bg-[#c7c42a]`} />
                <div className="overflow-hidden">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#c7c42a]">
                    {editingMessage ? 'Editing Message' : `Replying to ${replyingTo?.senderName}`}
                  </p>
                  <p className="text-xs text-white/60 truncate italic">
                    {editingMessage ? editingMessage.text : replyingTo?.text}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setReplyingTo(null);
                  setEditingMessage(null);
                  if (editingMessage) setInputText('');
                }}
                className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <form 
          onSubmit={handleSendMessage}
          className="max-w-5xl mx-auto flex items-center gap-2"
        >
          <input 
            ref={fileInputRef}
            type="file" 
            className="hidden" 
            multiple 
            onChange={(e) => handleFileUpload(e.target.files)}
            accept="image/*,video/*,.pdf,.doc,.docx"
          />
          
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 md:p-3 text-[#c7c42a] hover:bg-[#c7c42a]/10 rounded-xl transition-all"
            title="Upload Files"
          >
            <ImageIcon size={20} className="md:w-6 md:h-6" />
          </button>

          <div className="flex-1 relative min-w-0">
            <input 
              type="text" 
              placeholder="Type a message..."
              className="w-full bg-[#2a3942] border-none rounded-xl px-4 md:px-6 py-2 md:py-3 text-sm text-white outline-none focus:ring-1 focus:ring-white/10 transition-all"
              value={inputText}
              onChange={handleInputChange}
            />
          </div>

          <button 
            type="submit"
            disabled={(!inputText.trim() && Object.keys(uploadProgress).length === 0) || isSending}
            className={`p-2 md:p-3 rounded-xl transition-all grow-0 shrink-0 ${
              (inputText.trim() || Object.keys(uploadProgress).length > 0) && !isSending
                ? 'bg-[#c7c42a] text-black shadow-lg shadow-[#c7c42a]/20'
                : 'bg-white/5 text-white/20 cursor-not-allowed'
            }`}
          >
            {isSending ? (
              <Loader color="black" />
            ) : (
              <Send size={20} className="md:w-6 md:h-6" />
            )}
          </button>
        </form>
      </footer>
    </motion.div>
  );
}
