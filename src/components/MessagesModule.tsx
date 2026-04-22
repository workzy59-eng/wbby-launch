import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  X, 
  Check, 
  CheckCheck, 
  Image as ImageIcon, 
  Paperclip, 
  Search,
  MessageCircle,
  MoreVertical,
  Smile,
  FileText,
  ChevronLeft,
  Users,
  Video,
  Mic,
  Plus,
  StickyNote,
  CornerUpLeft,
  Edit,
  Trash2,
  Briefcase,
  ShieldCheck,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';

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
    <span className={`text-[10px] font-black uppercase tracking-[0.2em] text-${color === 'white' ? 'white' : '[#c7c42a]'} animate-pulse italic`}>Loading...</span>
  </div>
);
import { FirebaseUser } from '../firebase';
import { UserProfile, Message, Project, Attachment } from '../types';
import { 
  sendDirectMessage, 
  sendMessage,
  getDirectMessages, 
  updateDirectMessage,
  getConversations,
  getProfiles,
  getAdmins,
  getUserProfile,
  setUserTyping,
  getTypingStatus,
  uploadFile,
  markConversationAsSeen,
  markProjectAsSeen,
  markMessageAsDelivered,
  markMessageAsSeen,
  deleteDirectMessage
} from '../services/database';
import { formatDate, isSameDay } from '../lib/utils';
import ChatSystem from './ChatSystem';
import imageCompression from 'browser-image-compression';

interface MessagesModuleProps {
  currentUser: FirebaseUser;
  profile: UserProfile | null;
  onClose: () => void;
  fullScreen?: boolean;
  projects?: Project[];
  initialRecipientId?: string;
}

interface Conversation {
  id: string;
  lastMessage: string;
  lastMessageAt: any;
  lastSenderId: string;
  participants: string[];
  unreadCount?: { [userId: string]: number };
  recipientProfile?: UserProfile;
  isProject?: boolean;
  project?: Project;
}

interface UploadProgress {
  [fileName: string]: number;
}

export default function MessagesModule({ currentUser, profile, onClose, fullScreen = true, projects = [], initialRecipientId }: MessagesModuleProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  
  useEffect(() => {
    if (initialRecipientId) {
      const existing = conversations.find(c => c.participants.includes(initialRecipientId));
      if (existing) {
        setActiveConversation(existing);
      } else if (!activeConversation || (activeConversation.id === 'new' && activeConversation.participants.includes(initialRecipientId))) {
        // Only fetch if not already set to this recipient
        getUserProfile(initialRecipientId).then(p => {
          if (p) {
            setActiveConversation({
              id: 'new',
              lastMessage: '',
              lastMessageAt: null,
              lastSenderId: '',
              participants: [currentUser.uid, initialRecipientId],
              recipientProfile: p as UserProfile
            });
          }
        });
      }
    }
  }, [initialRecipientId, conversations]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>([]);
  const [showUserList, setShowUserList] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [messageSearchQuery, setMessageSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [showActions, setShowActions] = useState<string | null>(null);
  
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'favorites'>('all');
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const notificationSound = useRef<HTMLAudioElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    notificationSound.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
    
    const fetchProfiles = async () => {
      let profiles: UserProfile[] = [];
      
      // Admin can message everyone, others can message admin
      profiles = await getProfiles();
      
      let filteredProfiles = profiles.filter(p => p.uid !== currentUser.uid) as UserProfile[];
      
      // Messaging Restriction: Developers and Clients can only message Admin
      if (profile?.role !== 'admin') {
        filteredProfiles = filteredProfiles.filter(p => p.role === 'admin');
      }
      
      setAllProfiles(filteredProfiles);
      return filteredProfiles;
    };

    fetchProfiles();

    const unsubConversations = getConversations(currentUser.uid, async (convs) => {
      try {
        const enrichedConvs = await Promise.all(convs.map(async (conv) => {
          const recipientId = conv.participants.find((id: string) => id !== currentUser.uid);
          const recipientProfile = await getUserProfile(recipientId);
          return { ...conv, recipientProfile };
        }));
        
        let finalConvs = enrichedConvs;
        
        // Add project conversations
        const projectConvs: Conversation[] = projects.map(p => ({
          id: p.id,
          lastMessage: p.lastMessage || 'Project Chat',
          lastMessageAt: p.lastMessageAt || p.createdAt,
          lastSenderId: p.lastSenderId || '',
          participants: [p.userId, p.developerId].filter(id => id && typeof id === 'string') as string[],
          isProject: true,
          project: p,
          unreadCount: p.unreadCount
        }));

        // Sort by date
        const allConvs = [...projectConvs, ...finalConvs].sort((a, b) => {
          const dateA = a.lastMessageAt?.toMillis?.() || a.lastMessageAt || 0;
          const dateB = b.lastMessageAt?.toMillis?.() || b.lastMessageAt || 0;
          return dateB - dateA;
        });

        // Check for new messages to play sound
        setConversations(prev => {
          if (prev.length > 0) {
            const hasNewMessage = allConvs.some(newConv => {
              const oldConv = prev.find(c => c.id === newConv.id);
              if (!oldConv) return false;
              
              const newUnread = newConv.unreadCount?.[currentUser.uid] || 0;
              const oldUnread = oldConv.unreadCount?.[currentUser.uid] || 0;
              
              return newUnread > oldUnread;
            });

            if (hasNewMessage) {
              notificationSound.current?.play().catch(() => {});
            }
          }
          return allConvs as Conversation[];
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading conversations:', error);
        setIsLoading(false);
      }
    });

    return () => unsubConversations?.();
  }, [currentUser.uid, profile?.role, projects]);

  useEffect(() => {
    if (!activeConversation) return;

    // Mark as seen when opening
    if (activeConversation.isProject) {
      markProjectAsSeen(activeConversation.id, currentUser.uid);
    } else if (activeConversation.id !== 'new') {
      markConversationAsSeen(activeConversation.id, currentUser.uid);
    }

    if (activeConversation.isProject) {
      const q = query(
        collection(db, 'projects', activeConversation.id, 'messages'),
        orderBy('createdAt', 'asc')
      );
      const unsub = onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
        setMessages(msgs);
        
        // Mark as delivered for incoming messages
        msgs.forEach(async (m) => {
          if (m.senderId !== currentUser.uid && m.status === 'sent') {
            await markMessageAsDelivered(m.id, undefined, activeConversation.id);
          }
        });
      });
      return () => unsub();
    }

    const recipientId = activeConversation.participants.find(id => id !== currentUser.uid);
    if (!recipientId) return;

    const unsubMessages = getDirectMessages(currentUser.uid, recipientId, (messagesData) => {
      const newMessages = (messagesData as Message[]).filter(m => !m.hiddenFor?.includes(currentUser.uid));
      setMessages(newMessages);

      // Mark as delivered or seen if recipient receives it
      newMessages.forEach(async (m) => {
        if (m.senderId !== currentUser.uid) {
          if (m.status === 'sent') {
            await markMessageAsDelivered(m.id, activeConversation.id);
          }
          if (m.status !== 'seen') {
            await markMessageAsSeen(m.id, activeConversation.id);
          }
        }
      });
    });

    // Typing status listener
    const unsubTyping = getTypingStatus(activeConversation.id, (typing) => {
      setTypingUsers(typing.filter(uid => uid !== currentUser.uid));
    });

    return () => {
      unsubMessages?.();
      unsubTyping?.();
    };
  }, [activeConversation, currentUser.uid]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typingUsers]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && Object.keys(uploadProgress).length === 0) || !activeConversation || isSending) return;

    const recipientId = activeConversation.participants.find(id => id !== currentUser.uid);
    if (!recipientId) return;

    setIsSending(true);
    const messageText = inputText.trim();
    const currentReplyingTo = replyingTo;
    const currentEditingMessage = editingMessage;
    
    try {
      if (activeConversation.isProject) {
        const messageData = {
          senderId: currentUser.uid,
          senderName: currentUser.displayName || profile?.displayName || 'User',
          text: messageText,
          status: 'sent',
          replyTo: currentReplyingTo ? {
            id: currentReplyingTo.id,
            text: currentReplyingTo.text,
            senderName: currentReplyingTo.senderName
          } : null
        };
        await sendMessage(activeConversation.id, messageData);
        setReplyingTo(null);
      } else if (currentEditingMessage) {
        await updateDirectMessage(recipientId, currentEditingMessage.id, {
          text: messageText,
          edited: true,
          updatedAt: new Date()
        });
        setEditingMessage(null);
      } else {
        await sendDirectMessage(recipientId, {
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
      setInputText('');
      // Clear typing status
      if (activeConversation.id !== 'new' && !activeConversation.isProject) {
        setUserTyping(activeConversation.id, currentUser.uid, false);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    
    if (activeConversation && activeConversation.id !== 'new' && !activeConversation.isProject) {
      setUserTyping(activeConversation.id, currentUser.uid, true);
      
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setUserTyping(activeConversation.id, currentUser.uid, false);
      }, 3000);
    }
  };

  const handleFileUpload = async (files: FileList | null, isImage: boolean) => {
    if (!files || files.length === 0 || !activeConversation || isSending) return;
    
    let recipientId: string | undefined;
    if (!activeConversation.isProject) {
      recipientId = activeConversation.participants.find(id => id !== currentUser.uid);
      if (!recipientId) return;
    }

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

        setUploadProgress(prev => ({ ...prev, [file.name]: 50 }));
        
        try {
          const fileData = await uploadFile(file, isImage ? 'images' : 'attachments');
          attachments.push({
            name: file.name,
            type: file.type,
            url: fileData,
            size: file.size
          });
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
        }
      }

      if (attachments.length > 0) {
        if (activeConversation.isProject) {
          await sendMessage(activeConversation.id, {
            senderId: currentUser.uid,
            senderName: currentUser.displayName || profile?.displayName || 'User',
            text: isImage ? 'Sent images' : 'Sent attachments',
            fileData: attachments[0].url,
            attachments,
            status: 'sent'
          });
        } else if (recipientId) {
          await sendDirectMessage(recipientId, {
            senderId: currentUser.uid,
            senderName: currentUser.displayName || profile?.displayName || 'User',
            text: isImage ? 'Sent images' : 'Sent attachments',
            fileData: attachments[0].url,
            attachments,
            status: 'sent'
          });
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

  const handleMessageAdmin = async () => {
    setIsLoading(true);
    try {
      const admins = await getAdmins();
      if (admins.length > 0) {
        // Find the main admin by email if possible, else take the first one
        const mainAdmin = admins.find(a => a.email === 'workzy59@gmail.com') || admins[0];
        startNewChat(mainAdmin);
      } else {
        alert('No admin found. Please try again later.');
      }
    } catch (error) {
      console.error('Error finding admin:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = (user: UserProfile) => {
    const existingConv = conversations.find(c => !c.isProject && c.participants.includes(user.uid));
    if (existingConv) {
      setActiveConversation(existingConv);
    } else {
      setActiveConversation({
        id: 'new',
        lastMessage: '',
        lastMessageAt: null,
        lastSenderId: '',
        participants: [currentUser.uid, user.uid],
        recipientProfile: user
      });
    }
    setShowUserList(false);
  };

  const filteredConversations = conversations.filter(c => {
    // Search
    const matchesSearch = c.isProject 
      ? c.project?.businessName.toLowerCase().includes(searchQuery.toLowerCase())
      : c.recipientProfile?.displayName.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    // Filter
    if (activeFilter === 'unread') {
      return (c.unreadCount?.[currentUser.uid] || 0) > 0;
    }
    // Favorites could be implemented later with a field, for now just show all if favorites selected
    return true;
  });

  const renderMessages = () => {
    const filteredMessages = messageSearchQuery
      ? messages.filter(m => m.text.toLowerCase().includes(messageSearchQuery.toLowerCase()))
      : messages;

    return filteredMessages.map((m, idx) => {
      const isMe = m.senderId === currentUser.uid;
      const showDate = idx === 0 || (m.createdAt && messages[idx - 1].createdAt && !isSameDay(m.createdAt, messages[idx - 1].createdAt));
      const isActionsVisible = showActions === m.id;
      const isFirstOfGroup = idx === 0 || messages[idx-1].senderId !== m.senderId;
      
      return (
        <React.Fragment key={m.id}>
          {showDate && (
            <div className="flex justify-center my-6">
              <span className="px-4 py-1.5 bg-[#182229] border border-[#ffffff10] rounded-lg text-[11px] font-medium text-[#8696a0] uppercase tracking-widest shadow-sm">
                {formatDate(m.createdAt, 'separator')}
              </span>
            </div>
          )}
          <div 
            className={`flex items-end mb-0.5 group ${isMe ? 'justify-end' : 'justify-start'}`}
            onMouseEnter={() => setShowActions(m.id)}
            onMouseLeave={() => setShowActions(null)}
          >
            <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] md:max-w-[65%] relative`}>
              {/* Message Actions Dropdown */}
              <AnimatePresence>
                {isActionsVisible && !m.isDeleted && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className={`absolute top-0 ${isMe ? 'right-full mr-2' : 'left-full ml-2'} z-10 flex items-center gap-1 bg-[#2a3942] p-1 rounded-xl border border-white/10 shadow-2xl`}
                  >
                    <button 
                      onClick={() => setReplyingTo(m)}
                      className="p-2 hover:bg-white/5 rounded-lg text-[#8696a0] hover:text-[#00a884] transition-all"
                    >
                      <CornerUpLeft size={16} />
                    </button>
                    {isMe && (
                      <button 
                        onClick={() => {
                          setEditingMessage(m);
                          setInputText(m.text);
                        }}
                        className="p-2 hover:bg-white/5 rounded-lg text-[#8696a0] hover:text-[#00a884] transition-all"
                      >
                        <Edit size={16} />
                      </button>
                    )}
                    <button 
                      onClick={async () => {
                        const recipientId = activeConversation.participants.find(id => id !== currentUser.uid);
                        if (recipientId) {
                          await deleteDirectMessage(recipientId, m.id, isMe, currentUser.uid);
                        }
                      }}
                      className="p-2 hover:bg-white/5 rounded-lg text-[#8696a0] hover:text-red-400 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className={`relative px-3 py-2 rounded-xl text-[14.2px] leading-[19px] shadow-sm ${
                isMe 
                  ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-none' 
                  : 'bg-[#202c33] text-[#e9edef] border border-white/5 rounded-tl-none'
              } ${!isFirstOfGroup ? (isMe ? 'rounded-tr-xl' : 'rounded-tl-xl') : ''}`}>
                
                {/* Tail placeholder if needed, but rounded-none handles it well enough visually */}

                {m.isDeleted ? (
                  <p className="text-[12px] italic text-[#8696a0] flex items-center gap-2">
                    <Trash2 size={12} />
                    This message was deleted
                  </p>
                ) : (
                  <>
                    {m.replyTo && (
                      <div className={`mb-2 p-2 rounded-lg border-l-4 bg-[#00000020] ${isMe ? 'border-[#00a884]' : 'border-[#8696a0]'}`}>
                        <p className="text-[11px] font-bold text-[#00a884] mb-0.5">
                          {m.replyTo.senderName}
                        </p>
                        <p className="text-[12px] text-[#8696a0] truncate">
                          {m.replyTo.text}
                        </p>
                      </div>
                    )}
                    
                    {/* Attachment preview */}
                    {m.fileData && (
                      <div className="mb-2 rounded-lg overflow-hidden cursor-pointer bg-[#182229] border border-white/5" onClick={() => window.open(m.fileData, '_blank')}>
                         {m.type === 'image' || m.text === 'Sent an image' || (m.fileData.match(/\.(jpeg|jpg|gif|png)$/) != null) ? (
                           <img src={m.fileData} alt="Attachment" className="max-w-full h-auto rounded-lg" />
                         ) : (
                           <div className="p-3 flex items-center gap-3">
                             <div className="w-10 h-10 rounded-lg bg-[#202c33] flex items-center justify-center text-[#8696a0]">
                               <FileText size={20} />
                             </div>
                             <div className="flex-1 min-w-0">
                               <p className="text-xs font-medium text-[#e9edef] truncate">{m.fileName || 'Document'}</p>
                               <p className="text-[10px] text-[#8696a0] uppercase font-bold tracking-tighter">File</p>
                             </div>
                           </div>
                         )}
                      </div>
                    )}

                    <p className="whitespace-pre-wrap break-words">
                      {m.text}
                      {m.edited && (
                        <span className="text-[10px] text-[#8696a0] ml-2 italic">
                          (edited)
                        </span>
                      )}
                    </p>
                  </>
                )}
                <div className="flex items-center gap-1 mt-1 justify-end">
                   <span className="text-[11px] text-[#8696a0]">
                    {formatDate(m.createdAt, 'h:mm a')}
                  </span>
                  {isMe && !m.isDeleted && (
                    <span>
                      {m.status === 'seen' ? (
                        <CheckCheck size={15} className="text-[#53bdeb]" />
                      ) : m.status === 'delivered' ? (
                        <CheckCheck size={15} className="text-[#8696a0]" />
                      ) : (
                        <Check size={15} className="text-[#8696a0]" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </React.Fragment>
      );
    });
  };

  const containerClasses = fullScreen 
    ? "fixed inset-0 z-[200] bg-[#0b141a] flex flex-col md:flex-row overflow-hidden font-sans"
    : "relative w-full h-[calc(100vh-180px)] bg-[#0b141a] rounded-3xl border border-white/5 flex flex-col md:flex-row overflow-hidden font-sans shadow-2xl";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={containerClasses}
    >
      {/* Sidebar / List View */}
      <div className={`w-full md:w-[450px] border-r border-[#202c33] flex flex-col bg-[#111b21] ${activeConversation ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#e9edef]">Chats</h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowUserList(true)}
              className="p-2 hover:bg-[#202c33] rounded-full text-[#aebac1] transition-all"
            >
              <Plus size={20} />
            </button>
            <button 
              onClick={onClose}
              className={`p-2 hover:bg-[#202c33] rounded-full text-[#aebac1] transition-all ${!fullScreen ? 'lg:hidden' : ''}`}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="px-4 py-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8696a0]" size={16} />
            <input 
              type="text"
              placeholder="Search or start a new chat"
              className="w-full bg-[#202c33] border-none rounded-xl py-2 pl-12 pr-4 text-sm text-[#d1d7db] outline-none focus:ring-0 placeholder-[#8696a0]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {['all', 'unread', 'favorites'].map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f as any)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-all whitespace-nowrap ${
                  activeFilter === f 
                    ? 'bg-[#00a884]/20 text-[#00a884]' 
                    : 'bg-[#202c33] text-[#8696a0] hover:bg-[#2a3942]'
                }`}
              >
                {f} {f === 'unread' && conversations.reduce((acc, c) => acc + (c.unreadCount?.[currentUser.uid] || 0), 0) > 0 && (
                  <span className="ml-1 opacity-60">
                    {conversations.reduce((acc, c) => acc + (c.unreadCount?.[currentUser.uid] || 0), 0)}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar mt-2">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <Loader color="white" />
              <p className="text-[10px] font-black uppercase tracking-widest text-[#8696a0] animate-pulse">Loading conversations...</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center h-full flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 bg-[#202c33] rounded-full flex items-center justify-center text-[#8696a0]">
                {activeFilter === 'unread' ? <CheckCheck size={32} /> : <MessageCircle size={32} />}
              </div>
              <div className="space-y-1">
                <h3 className="text-[#e9edef] font-bold">
                  {activeFilter === 'unread' ? "No unread messages" : 
                   activeFilter === 'favorites' ? "No favorites yet" :
                   searchQuery ? "No chats found" : "No conversations yet"}
                </h3>
                <p className="text-xs text-[#8696a0] max-w-[200px] mx-auto">
                  {activeFilter === 'unread' ? "You're all caught up 🎉" :
                   activeFilter === 'favorites' ? "Star conversations to find them quickly." :
                   searchQuery ? "Try searching for something else." :
                   "Click + to start chatting with our team. We'll respond instantly 🚀"}
                </p>
              </div>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveConversation(conv)}
                className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-[#202c33] transition-all border-b border-[#202c33]/30 ${activeConversation?.id === conv.id ? 'bg-[#2a3942]' : ''}`}
              >
                <div className="relative shrink-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-black font-bold text-lg ${
                    conv.isProject 
                      ? 'bg-blue-500' 
                      : conv.recipientProfile?.displayName === 'SAI ROSHAN'
                        ? 'bg-transparent border border-[#00a884]/30 text-[#00a884]'
                        : 'bg-[#00a884]'
                  }`}>
                    {conv.isProject ? <Briefcase size={22} /> : (conv.recipientProfile?.displayName?.[0] || 'U')}
                  </div>
                  {!conv.isProject && conv.recipientProfile?.status === 'online' && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#00a884] border-2 border-[#111b21] rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="font-medium text-[#e9edef] truncate text-base">
                      {conv.isProject ? conv.project?.businessName : (conv.recipientProfile?.displayName === 'SAI ROSHAN' ? 'Webby Launch' : conv.recipientProfile?.displayName)}
                    </span>
                    <span className={`text-[10px] font-medium shrink-0 ${conv.unreadCount?.[currentUser.uid] ? 'text-[#00a884]' : 'text-[#8696a0]'}`}>
                      {conv.lastMessageAt ? formatDate(conv.lastMessageAt, 'h:mm a') : ''}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className={`text-sm truncate font-normal pr-2 ${conv.unreadCount?.[currentUser.uid] ? 'text-[#e9edef]' : 'text-[#8696a0]'}`}>
                      {conv.lastSenderId === currentUser.uid && <CheckCheck size={14} className="inline mr-1 text-[#53bdeb]" />}
                      {conv.lastMessage}
                    </p>
                    {conv.unreadCount?.[currentUser.uid] ? (
                      <div className="bg-[#00a884] text-black text-[11px] font-bold min-w-[20px] h-5 rounded-full flex items-center justify-center px-1 shadow-md shrink-0">
                        {conv.unreadCount[currentUser.uid]}
                      </div>
                    ) : null}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat View */}
      <div className={`flex-1 flex flex-col bg-[#0b141a] relative ${!activeConversation ? 'hidden md:flex' : 'flex'}`}>
        <div 
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
            backgroundRepeat: 'repeat',
            backgroundSize: '400px',
          }}
        />
        
        {activeConversation ? (
          <div className="flex-1 flex flex-col overflow-hidden relative z-10">
            {/* Chat Header */}
            <header className="px-4 py-2 border-b border-[#202c33] flex items-center justify-between bg-[#202c33] relative z-20">
              <div className="flex items-center gap-3 cursor-pointer">
                <button 
                  onClick={() => setActiveConversation(null)}
                  className="p-1 hover:bg-white/5 rounded-full text-[#aebac1] md:hidden"
                >
                  <ChevronLeft size={24} />
                </button>
                <div className="relative">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-black font-bold text-lg ${
                    activeConversation.isProject ? 'bg-blue-500 text-white' : 
                    activeConversation.recipientProfile?.displayName === 'SAI ROSHAN'
                      ? 'bg-transparent border border-[#00a884]/30 text-[#00a884]'
                      : 'bg-[#00a884]'
                  }`}>
                    {activeConversation.isProject ? <Briefcase size={20} /> : activeConversation.recipientProfile?.displayName === 'SAI ROSHAN' ? <ShieldCheck size={20} /> : (activeConversation.recipientProfile?.displayName?.[0] || 'U')}
                  </div>
                  {!activeConversation.isProject && activeConversation.recipientProfile?.status === 'online' && (
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#00a884] border-2 border-[#111b21] rounded-full"></div>
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-[#e9edef] text-sm">
                    {activeConversation.isProject ? activeConversation.project?.businessName : (activeConversation.recipientProfile?.displayName === 'SAI ROSHAN' ? 'Webby Launch' : activeConversation.recipientProfile?.displayName)}
                  </h3>
                  <div className="flex items-center gap-2">
                    {typingUsers.length > 0 ? (
                      <p className="text-[10px] text-[#00a884] font-medium animate-pulse">typing...</p>
                    ) : (
                      <p className={`text-[10px] font-medium ${
                        !activeConversation.isProject && activeConversation.recipientProfile?.status === 'online' ? 'text-[#00a884]' : 'text-[#8696a0]'
                      }`}>
                        {activeConversation.isProject ? 'Project Channel' : (activeConversation.recipientProfile?.status === 'online' ? 'Online' : `Last seen ${activeConversation.recipientProfile?.lastSeen ? formatDate(activeConversation.recipientProfile.lastSeen, 'MMM d, h:mm a') : 'recently'}`)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[#aebac1]">
                <button className="p-2 hover:bg-[#2a3942] rounded-full transition-all">
                  <Video size={18} />
                </button>
                <button 
                  onClick={() => setShowSearch(!showSearch)}
                  className={`p-2 rounded-full transition-all ${showSearch ? 'bg-[#00a884]/20 text-[#00a884]' : 'hover:bg-[#2a3942]'}`}
                >
                  <Search size={18} />
                </button>
                <button className="p-2 hover:bg-[#2a3942] rounded-full transition-all">
                  <MoreVertical size={18} />
                </button>
              </div>
            </header>

            {showSearch && (
              <div className="p-4 bg-[#111b21] border-b border-[#202c33] animate-in slide-in-from-top duration-300 relative z-20">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8696a0]" size={16} />
                  <input 
                    type="text"
                    placeholder="Search messages..."
                    className="w-full bg-[#202c33] border-none rounded-xl py-2 pl-10 pr-4 text-xs text-[#d1d7db] outline-none placeholder-[#8696a0]"
                    value={messageSearchQuery}
                    onChange={(e) => setMessageSearchQuery(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>
            )}

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 md:px-8 py-4 space-y-1.5 scrollbar-hide relative z-10 custom-scrollbar"
            >
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full space-y-6">
                  <div className="w-20 h-20 bg-[#202c33] rounded-full flex items-center justify-center relative">
                    <MessageCircle size={40} className="text-[#8696a0]" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#c7c42a] rounded-full flex items-center justify-center text-black">
                      <Sparkles size={14} />
                    </div>
                  </div>
                  <div className="text-center space-y-1">
                    <h3 className="text-lg font-bold text-[#e9edef]">Start a Conversation</h3>
                    <p className="text-xs text-[#8696a0] max-w-[240px] mx-auto leading-relaxed italic uppercase font-black tracking-tighter">
                      {activeConversation.isProject 
                        ? "Discuss your project details here."
                        : `Say hello to ${activeConversation.recipientProfile?.displayName === 'SAI ROSHAN' ? 'Webby Launch' : (activeConversation.recipientProfile?.displayName || 'our team')}!`}
                    </p>
                  </div>
                </div>
              )}
              {renderMessages()}
              {typingUsers.length > 0 && (
                <div className="flex items-center gap-2 text-[10px] text-[#c7c42a] font-black uppercase tracking-widest italic animate-pulse">
                  <div className="flex gap-1">
                    <span className="w-1 h-1 bg-[#c7c42a] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1 h-1 bg-[#c7c42a] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1 h-1 bg-[#c7c42a] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                  {activeConversation.recipientProfile?.displayName} is typing
                </div>
              )}
            </div>

            {/* Input Area */}
            <footer className="p-6 bg-white/5 border-t border-white/5 relative">
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
                      <div className={`w-1 h-10 rounded-full ${editingMessage ? 'bg-[#c7c42a]' : 'bg-blue-500'}`} />
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

              <form onSubmit={handleSendMessage} className="flex items-center gap-2 max-w-4xl mx-auto">
                <input 
                  type="file" 
                  id="direct-image-upload" 
                  className="hidden" 
                  accept="image/*" 
                  multiple 
                  onChange={(e) => handleFileUpload(e.target.files, true)}
                />
                <input 
                  type="file" 
                  id="direct-file-upload" 
                  className="hidden" 
                  multiple 
                  onChange={(e) => handleFileUpload(e.target.files, false)}
                />
                
                <button 
                  type="button"
                  onClick={() => document.getElementById('direct-image-upload')?.click()}
                  className="p-3 text-[#c7c42a] hover:bg-[#c7c42a]/10 rounded-xl transition-all"
                  title="Upload Image"
                >
                  <ImageIcon size={24} />
                </button>
                
                <button 
                  type="button"
                  onClick={() => document.getElementById('direct-file-upload')?.click()}
                  className="p-3 text-[#c7c42a] hover:bg-[#c7c42a]/10 rounded-xl transition-all"
                  title="Upload File"
                >
                  <Paperclip size={24} />
                </button>

                <div className="flex-1 relative">
                  <input 
                    type="text"
                    placeholder="Type a message..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-6 pr-14 py-4 text-sm text-white outline-none focus:border-[#c7c42a]/50 transition-all"
                    value={inputText}
                    onChange={handleInputChange}
                  />
                  <button 
                    type="submit"
                    disabled={!inputText.trim() || isSending}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-xl transition-all ${
                      inputText.trim() && !isSending 
                        ? 'bg-[#c7c42a] text-black shadow-lg shadow-[#c7c42a]/20' 
                        : 'bg-white/5 text-white/20 cursor-not-allowed'
                    }`}
                  >
                    {isSending ? (
                      <Loader color="black" />
                    ) : (
                      <Send size={20} />
                    )}
                  </button>
                </div>
              </form>
            </footer>

            {/* Upload Progress Overlay */}
            <AnimatePresence>
              {Object.keys(uploadProgress).length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute bottom-32 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-[120]"
                >
                  <div className="bg-[#1e293b] p-6 rounded-[2rem] border border-white/10 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-white">Uploading...</h4>
                      <div className="w-4 h-4 border-2 border-[#c7c42a] border-t-transparent rounded-full animate-spin" />
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
                              className="h-full bg-[#c7c42a]"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-white/20 space-y-6">
              <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center">
                <MessageCircle size={48} strokeWidth={1.5} className="text-[#c7c42a]" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-black text-white/40 uppercase italic tracking-tighter">Select a conversation</h3>
                <p className="text-xs font-bold uppercase tracking-widest opacity-40">Choose someone to start chatting</p>
              </div>
            </div>
          )}
      </div>

      {/* User List Modal for New Chat */}
      <AnimatePresence>
        {showUserList && (
          <div className="fixed inset-0 z-[210] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#0f172a] border border-white/10 rounded-[2.5rem] w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">New Message</h3>
                <button onClick={() => setShowUserList(false)} className="text-white/40 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              <div className="p-4 border-b border-white/5">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input 
                    type="text"
                    placeholder="Search users..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white outline-none focus:border-[#c7c42a]/50 transition-all"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {allProfiles.map((user) => (
                  <button
                    key={user.uid}
                    onClick={() => startNewChat(user)}
                    className="w-full p-4 flex items-center gap-4 hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/5"
                  >
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white font-black">
                        {user.displayName?.[0] || 'U'}
                      </div>
                      <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-[#0f172a] rounded-full ${
                        user.status === 'online' ? 'bg-green-500' : 
                        user.status === 'away' ? 'bg-#c7c42a' : 'bg-gray-500'
                      }`}></div>
                    </div>
                    <div className="text-left">
                      <p className="font-black text-white uppercase tracking-tight text-sm">{user.displayName}</p>
                      <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{user.role}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
