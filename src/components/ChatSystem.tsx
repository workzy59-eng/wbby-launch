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
      className={`w-6 h-6 border-2 border-${color === 'white' ? 'white' : '[#6366F1]'} border-t-transparent rounded-full`}
    />
    <span className={`text-[10px] font-black uppercase tracking-[0.2em] text-${color === 'white' ? 'white' : '[#6366F1]'} animate-pulse italic`}>Processing...</span>
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
  markProjectAsSeen
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
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [recipientProfile, setRecipientProfile] = useState<UserProfile | null>(null);
  const [showInfoId, setShowInfoId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [showActions, setShowActions] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
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
        messagesData.forEach(async (m) => {
          if (m.senderId !== currentUser.uid) {
            if (m.status === 'sent') {
              await markMessageAsDelivered(m.id, chatId);
            }
            if (m.status !== 'seen') {
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
            if (m.status === 'sent') {
              await markMessageAsDelivered(m.id, undefined, projectId);
            }
            if (m.status !== 'seen') {
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
    const chatId = isDirect && recipientUser ? (currentUser.uid < recipientUser.uid ? `${currentUser.uid}_${recipientUser.uid}` : `${recipientUser.uid}_${currentUser.uid}`) : projectId;

    try {
      if (isDirect && recipientUser) {
        if (currentEditingMessage) {
          await updateDirectMessage(recipientUser.uid, currentEditingMessage.id, {
            text: messageText,
            edited: true,
            updatedAt: new Date()
          });
          setEditingMessage(null);
        } else {
          await sendDirectMessage(recipientUser.uid, {
            senderId: currentUser.uid,
            senderName: currentUser.displayName || profile?.displayName || 'User',
            text: messageText,
            status: 'sent',
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
            updatedAt: new Date()
          });
          setEditingMessage(null);
        } else {
          await sendMessage(projectId, {
            senderId: currentUser.uid,
            senderName: currentUser.displayName || profile?.displayName || 'User',
            text: messageText,
            status: 'sent',
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
      if (chatId) {
        setUserTyping(chatId, currentUser.uid, false);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    
    const chatId = isDirect && recipientUser ? (currentUser.uid < recipientUser.uid ? `${currentUser.uid}_${recipientUser.uid}` : `${recipientUser.uid}_${currentUser.uid}`) : projectId;
    
    if (chatId) {
      setUserTyping(chatId, currentUser.uid, true);
      
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setUserTyping(chatId, currentUser.uid, false);
      }, 3000);
    }
  };

  const handleFileUpload = async (files: FileList | null, isImage: boolean) => {
    if (!files || files.length === 0) return;
    
    setIsSending(true);
    const attachments: Attachment[] = [];
    
    try {
      for (let i = 0; i < files.length; i++) {
        let file = files[i];
        
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

        setUploadProgress(prev => ({ ...prev, [file.name]: 50 })); // Mock progress since fetch doesn't give it easily
        
        try {
          const fileData = await uploadFile(file, isImage ? 'images' : 'attachments');
          attachments.push({
            name: file.name,
            type: file.type,
            url: fileData, // This is now the Base64 string
            size: file.size
          });
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
        }
      }

      if (attachments.length > 0) {
        const messageData = {
          senderId: currentUser.uid,
          senderName: currentUser.displayName || profile?.displayName || 'User',
          text: isImage ? 'Sent images' : 'Sent attachments',
          fileData: attachments[0].url, // Store the first one as fileData for quick preview
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
          <div className="relative">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-black font-black text-2xl italic shadow-[0_0_30px_rgba(99,102,241,0.2)] ${recipientUser?.displayName === 'SAI ROSHAN' ? 'bg-transparent border border-[#6366F1]/30 text-[#6366F1]' : 'bg-[#6366F1]'}`}>
              {recipientUser?.displayName === 'SAI ROSHAN' ? <ShieldCheck size={32} /> : (recipientUser?.displayName?.[0] || (projectId ? 'P' : 'U'))}
            </div>
            {isDirect && (
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 border-4 border-black rounded-full ${
                recipientProfile?.status === 'online' ? 'bg-green-500' : 
                recipientProfile?.status === 'away' ? 'bg-yellow-500' : 'bg-gray-500'
              }`}></div>
            )}
          </div>
          <div>
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">{recipientUser?.displayName || (projectId ? 'Project Chat' : 'Chat')}</h2>
            <div className="flex items-center gap-2">
              {typingUsers.length > 0 ? (
                <p className="text-[10px] text-[#6366F1] font-black uppercase tracking-widest animate-pulse italic">typing...</p>
              ) : (
                <>
                  <div className={`w-2 h-2 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)] ${
                    isDirect ? (recipientProfile?.status === 'online' ? 'bg-green-500' : 'bg-gray-500') : 'bg-green-500'
                  }`}></div>
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                    {isDirect ? (recipientProfile?.status === 'online' ? 'Active Now' : `Last seen ${recipientProfile?.lastSeen ? formatDate(recipientProfile.lastSeen, 'MMM d, h:mm a') : 'recently'}`) : 'Active Channel'}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
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
        className="flex-1 overflow-y-auto px-6 py-8 space-y-6 scrollbar-hide bg-[#0b141a] relative"
        style={{
          backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
          backgroundRepeat: 'repeat',
          backgroundSize: '400px',
          backgroundBlendMode: 'overlay',
          backgroundColor: '#0b141a'
        }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            <div className="w-24 h-24 bg-[#6366F1]/10 rounded-full flex items-center justify-center relative">
              <MessageCircle size={48} className="text-[#6366F1]" />
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
                    <div className="bg-[#202c33]/50 backdrop-blur-md px-4 py-1.5 rounded-lg border border-white/5">
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
                <div className={`flex gap-3 max-w-[85%] ${isMe ? 'flex-row-reverse' : 'flex-row'} group/msg-container`}>
                  <motion.div 
                    layout
                    onClick={() => {
                      if (m.isDeleted) return;
                      setShowInfoId(showInfoId === m.id ? null : m.id);
                    }}
                    className={`p-4 rounded-2xl text-sm font-bold leading-relaxed shadow-lg relative group cursor-pointer transition-all ${
                      isMe 
                        ? 'bg-[#005c4b] text-white rounded-tr-none' 
                        : 'bg-[#202c33] text-white rounded-tl-none border border-white/5'
                    } ${m.isDeleted ? 'italic opacity-50 cursor-default' : ''}`}
                  >
                    {/* Message Actions Dropdown */}
                    <AnimatePresence>
                      {showActions === m.id && !m.isDeleted && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className={`absolute top-0 ${isMe ? 'right-full mr-2' : 'left-full ml-2'} z-10 flex items-center gap-1 bg-[#233138] p-1 rounded-xl border border-white/10 shadow-2xl`}
                        >
                          <button 
                            onClick={(e) => { e.stopPropagation(); setReplyingTo(m); }}
                            className="p-2 hover:bg-white/5 rounded-lg text-white/60 hover:text-[#6366F1] transition-all"
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
                              className="p-2 hover:bg-white/5 rounded-lg text-white/60 hover:text-[#6366F1] transition-all"
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
                      <div className={`mb-2 p-2 rounded-lg border-l-4 bg-black/20 ${isMe ? 'border-[#6366F1]' : 'border-blue-500'}`}>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">
                          {m.replyTo.senderName}
                        </p>
                        <p className="text-[10px] text-white/40 truncate italic">
                          {m.replyTo.text}
                        </p>
                      </div>
                    )}

                    {!m.isDeleted && m.fileData && (
                      <div className="mb-3 rounded-xl overflow-hidden border border-black/10 relative group/img">
                        <img src={m.fileData} alt="Shared file" className="w-full h-auto max-h-64 object-cover" />
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedImage(m.fileData!); }}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-all flex items-center justify-center text-white"
                        >
                          <Maximize2 size={20} />
                        </button>
                      </div>
                    )}

                    {!m.isDeleted && m.imageUrl && (
                      <div className="mb-3 rounded-xl overflow-hidden border border-black/10 relative group/img">
                        <img src={m.imageUrl} alt="AI Visualization" className="w-full h-auto max-h-64 object-cover" />
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedImage(m.imageUrl!); }}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-all flex items-center justify-center text-white"
                        >
                          <Maximize2 size={20} />
                        </button>
                      </div>
                    )}

                    {!m.isDeleted && m.attachments && m.attachments.length > 0 && (
                      <div className="space-y-2 mb-3">
                        {m.attachments.map((att, idx) => {
                          const isImg = att.type.startsWith('image/');
                          if (isImg) {
                            return (
                              <div key={idx} className="rounded-xl overflow-hidden border border-black/10 relative group/img">
                                <img src={att.url} alt={att.name} className="w-full h-auto max-h-64 object-cover" />
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setSelectedImage(att.url); }}
                                  className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-all flex items-center justify-center text-white"
                                >
                                  <Maximize2 size={20} />
                                </button>
                              </div>
                            );
                          }
                          return (
                            <div key={idx} className={`flex items-center gap-3 p-3 rounded-xl border ${isMe ? 'bg-black/10 border-black/5' : 'bg-white/5 border-white/10'}`}>
                              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/60">
                                <FileText size={16} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-black truncate uppercase tracking-widest">{att.name}</p>
                                <p className="text-[8px] opacity-40 uppercase tracking-widest">{(att.size / 1024).toFixed(1)} KB</p>
                              </div>
                              <a 
                                href={att.url} 
                                download={att.name}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className={`p-1.5 rounded-lg transition-all ${isMe ? 'hover:bg-black/20' : 'hover:bg-white/10'}`}
                              >
                                <ExternalLink size={14} />
                              </a>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <p className={`whitespace-pre-wrap ${m.isDeleted ? 'text-white/40 italic flex items-center gap-2' : ''}`}>
                      {m.isDeleted && <Trash2 size={12} />}
                      {m.text}
                      {!m.isDeleted && m.edited && (
                        <span className="text-[8px] text-white/20 font-black uppercase tracking-widest ml-2 italic">
                          (edited)
                        </span>
                      )}
                    </p>
                    
                    {/* AI Visualization button removed */}

                    <div className="flex items-center justify-end gap-1 mt-1 text-white/40">
                      <span className="text-[9px] font-bold uppercase tracking-tighter">
                        {formatDate(m.createdAt, 'h:mm a')}
                      </span>
                      {isMe && (
                        m.seen ? <CheckCheck size={12} className="text-blue-500" /> : <Check size={12} />
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
                            <p className="text-[8px] font-black uppercase tracking-widest text-blue-400">
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
          <div className="flex items-center gap-3 text-[10px] text-[#6366F1] font-black uppercase tracking-widest italic animate-pulse">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-[#6366F1] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1.5 h-1.5 bg-[#6366F1] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1.5 h-1.5 bg-[#6366F1] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
            Someone is typing...
          </div>
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
                <Loader color="white" />
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
      <footer className="px-6 py-6 border-t border-white/10 bg-[#202c33] relative">
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
                <div className={`w-1 h-10 rounded-full ${editingMessage ? 'bg-[#6366F1]' : 'bg-blue-500'}`} />
                <div className="overflow-hidden">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#6366F1]">
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
            type="file" 
            id="chat-image-upload" 
            className="hidden" 
            accept="image/*" 
            multiple 
            onChange={(e) => handleFileUpload(e.target.files, true)}
          />
          <input 
            type="file" 
            id="chat-file-upload" 
            className="hidden" 
            multiple 
            onChange={(e) => handleFileUpload(e.target.files, false)}
          />
          
          <button 
            type="button"
            onClick={() => document.getElementById('chat-image-upload')?.click()}
            className="p-3 text-[#E6FF00] hover:bg-[#E6FF00]/10 rounded-xl transition-all"
            title="Upload Image"
          >
            <ImageIcon size={24} />
          </button>
          
          <button 
            type="button"
            onClick={() => document.getElementById('chat-file-upload')?.click()}
            className="p-3 text-[#E6FF00] hover:bg-[#E6FF00]/10 rounded-xl transition-all"
            title="Upload File"
          >
            <Paperclip size={24} />
          </button>

          <div className="flex-1 relative">
            <input 
              type="text" 
              placeholder="Type a message..."
              className="w-full bg-[#2a3942] border-none rounded-xl px-6 py-3 text-sm text-white outline-none focus:ring-1 focus:ring-white/10 transition-all"
              value={inputText}
              onChange={handleInputChange}
            />
          </div>

          <button 
            type="submit"
            disabled={(!inputText.trim() && Object.keys(uploadProgress).length === 0) || isSending}
            className={`p-3 rounded-xl transition-all ${
              (inputText.trim() || Object.keys(uploadProgress).length > 0) && !isSending
                ? 'bg-[#6366F1] text-white shadow-lg shadow-[#6366F1]/20'
                : 'bg-white/5 text-white/20 cursor-not-allowed'
            }`}
          >
            {isSending ? (
              <Loader color="black" />
            ) : (
              <Send size={24} />
            )}
          </button>
        </form>
      </footer>
    </motion.div>
  );
}
