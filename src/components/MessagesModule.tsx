import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  X, 
  Check, 
  CheckCheck, 
  Image as ImageIcon, 
  Paperclip, 
  MessageCircle,
  MessageSquare,
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
  ChevronDown,
  Search,
  Lock,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Maximize2,
  ExternalLink
} from 'lucide-react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';

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
  deleteDirectMessage,
  searchUsers // Added
} from '../services/database';
import { formatDate, isSameDay } from '../lib/utils';
import ChatSystem from './ChatSystem';
import imageCompression from 'browser-image-compression';
import { ADMIN_EMAIL } from '../constants';

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
  const navigate = useNavigate();
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
  const [adminProfile, setAdminProfile] = useState<UserProfile | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [messageSearchQuery, setMessageSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [showActions, setShowActions] = useState<string | null>(null);
  const [mentionSearch, setMentionSearch] = useState('');
  const [mentionResults, setMentionResults] = useState<UserProfile[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionLoading, setMentionLoading] = useState(false);
  const [mentions, setMentions] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'favorites'>('all');
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const notificationSound = useRef<HTMLAudioElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    notificationSound.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
    
    const fetchProfiles = async () => {
      let profiles: UserProfile[] = [];
      
      const admins = await getAdmins();
      if (admins.length > 0) setAdminProfile(admins[0]);

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
        let enrichedConvs = await Promise.all(convs.map(async (conv) => {
          try {
            const recipientId = conv.participants.find((id: string) => id !== currentUser.uid);
            if (!recipientId) return { ...conv, recipientProfile: null };
            const recipientProfile = await getUserProfile(recipientId);
            return { ...conv, recipientProfile };
          } catch (e) {
            console.error('Error fetching recipient profile:', e);
            return { ...conv, recipientProfile: null };
          }
        }));

        // If client, ensure they can see the Admin even if no conversation exists yet
        if (profile?.role === 'client') {
          const admins = await getAdmins();
          const mainAdmin = admins.find(a => a.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) || admins[0];
          
          if (mainAdmin) {
            const adminConvExists = enrichedConvs.some(c => c.participants.includes(mainAdmin.uid));
            if (!adminConvExists) {
              enrichedConvs.push({
                id: 'new_admin',
                lastMessage: 'Contact Webby Launch Support',
                lastMessageAt: null,
                lastSenderId: '',
                participants: [currentUser.uid, mainAdmin.uid],
                recipientProfile: mainAdmin
              } as any);
            }
          }
        }
        
        // Sort by date
        const allConvs = enrichedConvs.sort((a, b) => {
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
    if (activeConversation.id !== 'new' && activeConversation.id !== 'new_admin') {
      markConversationAsSeen(activeConversation.id, currentUser.uid);
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

    const messageText = inputText.trim();
    const currentReplyingTo = replyingTo;
    const currentEditingMessage = editingMessage;
    const currentMentions = mentions;
    
    setIsSending(true);
    try {
      if (currentEditingMessage) {
        const recipientId = activeConversation.participants.find(id => id !== currentUser.uid);
        if (recipientId) {
          await updateDirectMessage(recipientId, currentEditingMessage.id, {
            text: messageText,
            edited: true,
            mentions: currentMentions,
            updatedAt: new Date()
          });
        }
        setEditingMessage(null);
      } else {
        const recipientId = activeConversation.participants.find(id => id !== currentUser.uid);
        if (recipientId) {
          await sendDirectMessage(recipientId, {
            senderId: currentUser.uid,
            senderName: currentUser.displayName || profile?.displayName || 'User',
            text: messageText,
            status: 'sent',
            mentions: currentMentions,
            type: 'text',
            replyTo: currentReplyingTo ? {
              id: currentReplyingTo.id,
              text: currentReplyingTo.text,
              senderName: currentReplyingTo.senderName
            } : null
          });
        }
        setReplyingTo(null);
      }
      setInputText('');
      setMentions([]);
      setShowMentions(false);
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

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputText(value);
    
    if (activeConversation && activeConversation.id !== 'new' && !activeConversation.isProject) {
      setUserTyping(activeConversation.id, currentUser.uid, true);
      
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setUserTyping(activeConversation.id, currentUser.uid, false);
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
          className="relative group/media mb-2 rounded-xl overflow-hidden border border-white/5 cursor-pointer bg-[#2a3942]" 
          onClick={() => setSelectedImage(mediaUrl)}
        >
          <img src={mediaUrl} alt="Shared" className="max-w-full h-auto max-h-[300px] object-cover" />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/media:opacity-100 transition-all flex items-center justify-center">
            <Maximize2 size={24} className="text-white drop-shadow-lg" />
          </div>
        </div>
      );
    }

    if (m.type === 'video') {
      return (
        <div className="relative group/media mb-2 rounded-xl overflow-hidden border border-white/5 bg-[#2a3942]">
          <video src={mediaUrl} className="max-w-full h-auto max-h-[300px]" controls />
        </div>
      );
    }

    if (m.type === 'file') {
      return (
        <div className={`flex items-center gap-3 p-3 rounded-xl border mb-2 ${m.senderId === currentUser.uid ? 'bg-black/10 border-black/5' : 'bg-white/5 border-white/10'}`}>
          <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-[#ffc107]">
            <FileText size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[#e9edef] truncate">{m.fileName || 'Attachment'}</p>
            <p className="text-[10px] text-[#8696a0] uppercase tracking-wider font-medium">Document</p>
          </div>
          <a 
            href={mediaUrl} 
            target="_blank" 
            rel="noreferrer" 
            className="p-2 hover:bg-white/10 rounded-lg transition-all text-[#8696a0] hover:text-[#e9edef]"
          >
            <ExternalLink size={18} />
          </a>
        </div>
      );
    }

    return null;
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !activeConversation || isSending) return;
    
    let recipientId = activeConversation.participants.find(id => id !== currentUser.uid);
    if (!recipientId) return;

    setIsSending(true);
    
    try {
      for (let i = 0; i < files.length; i++) {
        let file = files[i];
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        
        // Validate size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
          alert(`File ${file.name} is too large. Max 10MB.`);
          continue;
        }

        // Compress images
        if (isImage) {
          try {
            file = await imageCompression(file as any, { maxSizeMB: 1, maxWidthOrHeight: 1920 }) as any;
          } catch (e) { console.error(e); }
        }

        setUploadProgress(prev => ({ ...prev, [file.name]: 30 }));
        
        try {
          const url = await uploadFile(file);
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));

          await sendDirectMessage(recipientId, {
            senderId: currentUser.uid,
            senderName: currentUser.displayName || profile?.displayName || 'User',
            text: isImage ? 'Sent an image' : (isVideo ? 'Sent a video' : `Shared ${file.name}`),
            type: isImage ? 'image' : (isVideo ? 'video' : 'file'),
            mediaUrl: url,
            fileName: file.name
          });
        } catch (e) {
          console.error(e);
        }
      }
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

    let lastDate = '';

    return filteredMessages.map((m, idx) => {
      const isMe = m.senderId === currentUser.uid;
      const messageDate = m.createdAt ? formatDate(m.createdAt, 'separator') : '';
      const showDate = messageDate !== lastDate;
      if (showDate) lastDate = messageDate;
      
      const isActionsVisible = showActions === m.id;
      const isFirstOfGroup = idx === 0 || messages[idx-1].senderId !== m.senderId;
      
      return (
        <React.Fragment key={m.id}>
          {showDate && (
            <div className="flex justify-center my-6">
              <span className="px-4 py-1.5 bg-[#182229] border border-[#ffffff10] rounded-lg text-[11px] font-medium text-[#8696a0] uppercase tracking-widest shadow-sm">
                {messageDate}
              </span>
            </div>
          )}
          <div 
            className={`flex items-end mb-0.5 group ${isMe ? 'justify-end' : 'justify-start'}`}
            onMouseEnter={() => setShowActions(m.id)}
            onMouseLeave={() => setShowActions(null)}
          >
            <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[80%] md:max-w-[70%] relative`}>
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
                        const recipientId = activeConversation?.participants.find(id => id !== currentUser.uid);
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

              <div className={`relative px-4 py-2 rounded-xl text-[14.5px] leading-[20px] shadow-sm ${
                isMe 
                  ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-none' 
                  : 'bg-[#202c33] text-[#e9edef] rounded-tl-none'
              } ${!isFirstOfGroup ? (isMe ? 'rounded-tr-2xl' : 'rounded-tl-2xl') : ''}`}>
                
                {!isMe && isFirstOfGroup && (
                  <p className="text-[12px] font-bold text-[#34b7f1] mb-1">
                    {m.senderName === 'SAI ROSHAN' ? 'Webby Launch' : m.senderName}
                  </p>
                )}
                
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
                        <p className="text-[12px] text-[#8696a0] truncate italic">
                          {m.replyTo.text}
                        </p>
                      </div>
                    )}
                    
                    {/* Media content */}
                    {renderMedia(m)}

                    <p className="whitespace-pre-wrap break-words">
                      {m.text.split(' ').map((word, i) => {
                        if (word.startsWith('@')) {
                          return <span key={i} className="text-[#34b7f1] font-medium cursor-pointer hover:underline">{word} </span>;
                        }
                        return word + ' ';
                      })}
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
    ? "fixed inset-0 z-[200] bg-[#121212] flex flex-col md:flex-row overflow-hidden font-sans h-[100dvh]"
    : "relative w-full h-[calc(100vh-120px)] md:h-[calc(100vh-120px)] bg-[#121212] rounded-[1.5rem] md:rounded-[3rem] border border-white/5 flex flex-col md:flex-row overflow-hidden font-sans shadow-2xl";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={containerClasses}
    >
      {/* Sidebar / List View */}
      <div className={`w-full md:w-[420px] border-r border-[#ffffff05] flex flex-col bg-[#111b21] h-full ${activeConversation ? 'hidden md:flex' : 'flex'}`}>
        {/* Sidebar Header */}
        <div className="p-4 pt-4 md:pt-6 space-y-3 md:space-y-4 shrink-0">
          <div className="flex items-center justify-between px-2">
            <h1 className="text-xl md:text-[22px] font-bold text-[#e9edef] tracking-tight">Chats</h1>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setShowUserList(true)}
                className="p-2 hover:bg-[#202c33] text-[#aebac1] rounded-lg transition-all"
                title="New Chat"
              >
                <Plus size={20} className="stroke-[3]" />
              </button>
              <button 
                className="p-2 hover:bg-[#202c33] text-[#aebac1] rounded-lg transition-all"
              >
                <MoreVertical size={20} />
              </button>
            </div>
          </div>

          <div className="relative px-2">
            <div className="relative bg-[#202c33] rounded-xl flex items-center px-4 py-1.5 focus-within:ring-0 transition-all">
              <Search size={18} className="text-[#8696a0]" />
              <input 
                type="text"
                placeholder="Search or start a new chat"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none py-1.5 px-3 text-sm text-[#e9edef] placeholder:text-[#8696a0] outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 px-2 no-scrollbar">
            {[
              { id: 'all', label: 'All' },
              { id: 'unread', label: 'Unread' },
              { id: 'favorites', label: 'Favourites' }
            ].map(filter => (
              <button 
                key={filter.id}
                onClick={() => setActiveFilter(filter.id as any)}
                className={`px-4 py-1 rounded-full text-sm font-medium transition-all shrink-0 ${
                  activeFilter === filter.id 
                    ? 'bg-[#005c4b] text-[#00a884] shadow-sm' 
                    : 'bg-[#202c33] text-[#8696a0] hover:bg-[#2a3942]'
                }`}
              >
                {filter.label}
              </button>
            ))}
            <button className="p-1.5 bg-[#202c33] text-[#8696a0] rounded-full hover:bg-[#2a3942]">
              <ChevronDown size={14} />
            </button>
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto mt-2 custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <Loader2 className="animate-spin text-[#c7c42a]" size={32} />
              <p className="text-[10px] font-black uppercase tracking-widest text-[#8696a0] animate-pulse">Syncing Encrypted Data...</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-6">
              <p className="text-xs font-bold text-[#8696a0] uppercase tracking-widest mb-4 px-2">No active chats</p>
              <button
                onClick={() => {
                  if (adminProfile) {
                    startNewChat(adminProfile);
                  } else {
                    setActiveConversation({ 
                      id: 'new_admin', 
                      participants: [currentUser.uid, 'admin_wl'],
                      recipientProfile: { 
                        displayName: 'Webby Launch', 
                        email: 'workzy59@gmail.com', 
                        role: 'admin',
                        status: 'online'
                      } as any,
                      isProject: false 
                    } as any);
                  }
                }}
                className="w-full p-4 flex items-center gap-4 transition-all hover:bg-[#202c33] rounded-xl border border-[#ffffff05] group"
              >
                <div className="w-14 h-14 rounded-full bg-[#ffc107] flex items-center justify-center text-black font-black text-xl shadow-lg ring-2 ring-transparent group-hover:ring-[#ffc107]/20 transition-all">
                  WL
                </div>
                <div className="flex-1 text-left">
                  <div className="font-bold text-[#e9edef] flex items-center gap-2">
                    Webby Launch <span className="px-1.5 py-0.5 bg-[#00a884]/20 text-[#00a884] text-[8px] rounded uppercase">24/7 Support</span>
                  </div>
                  <p className="text-xs text-[#8696a0]">Start a chat with our admin team</p>
                </div>
                <ArrowRight size={18} className="text-[#8696a0] group-hover:text-white transition-all transform group-hover:translate-x-1" />
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#202c33]/20">
              {filteredConversations.map((conv) => {
                const unread = conv.unreadCount?.[currentUser.uid] || 0;
                const isWL = conv.recipientProfile?.email === 'workzy59@gmail.com';
                
                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConversation(conv)}
                    className={`w-full p-4 flex items-center gap-4 transition-all hover:bg-[#202c33] ${
                      activeConversation?.id === conv.id ? 'bg-[#2a3942]' : ''
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg shadow-lg ${
                        isWL ? 'bg-[#ffc107] text-[#000]' : 'bg-[#3b4a54] text-white'
                      }`}>
                        {conv.isProject ? <Briefcase size={28} /> : (isWL ? 'WL' : (conv.recipientProfile?.displayName?.[0] || 'U'))}
                      </div>
                    </div>

                    <div className="flex-1 text-left min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-[#e9edef] truncate">
                          {conv.isProject ? conv.project?.businessName : (isWL ? 'Webby Launch' : conv.recipientProfile?.displayName)}
                        </span>
                        <span className={`text-[11px] font-medium shrink-0 ${unread > 0 ? 'text-[#00a884]' : 'text-[#8696a0]'}`}>
                          {conv.lastMessageAt ? formatDate(conv.lastMessageAt, 'h:mm a') : ''}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <p className={`text-sm truncate pr-2 ${unread > 0 ? 'text-[#e9edef] font-medium' : 'text-[#8696a0]'}`}>
                          {conv.lastSenderId === currentUser.uid && (
                            <CheckCheck size={14} className="inline mr-1 text-[#53bdeb]" />
                          )}
                          {conv.lastMessage || 'No messages yet...'}
                        </p>
                        {unread > 0 && (
                          <div className="bg-[#00a884] text-[#111b21] text-[11px] font-bold min-w-[20px] h-5 rounded-full flex items-center justify-center px-1.5 shadow-md shrink-0">
                            {unread}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat View */}
      <div className={`flex-1 flex flex-col bg-[#0b141a] relative ${!activeConversation ? 'hidden md:flex' : 'flex'}`}>
        <div 
          className="absolute inset-0 opacity-[0.06] pointer-events-none z-0"
          style={{
            backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
            backgroundRepeat: 'repeat',
            backgroundSize: '400px',
          }}
        />
        
        {activeConversation ? (
          <div key={activeConversation.id} className="flex-1 flex flex-col overflow-hidden relative z-10">
            {/* Header */}
            <header className="px-3 md:px-5 py-2 md:py-2.5 border-b border-[#ffffff05] flex items-center justify-between bg-[#202c33] relative z-20 shadow-sm shrink-0">
              <div className="flex items-center gap-2 md:gap-4 cursor-pointer" onClick={() => activeConversation.isProject && navigate?.(`/projects/${activeConversation.project?.id}`)}>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveConversation(null);
                  }}
                  className="p-1.5 hover:bg-white/5 rounded-full text-white/40 md:hidden transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="relative">
                   <div className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm md:text-lg shadow-md ${
                    activeConversation.isProject ? 'bg-[#c7c42a] text-black' : 
                    activeConversation.recipientProfile?.email === 'workzy59@gmail.com' ? 'bg-[#ffc107] text-black' : 'bg-[#3b4a54] text-white'
                  }`}>
                    {activeConversation.isProject ? <Briefcase size={20} /> : (activeConversation.recipientProfile?.email === 'workzy59@gmail.com' ? 'WL' : (activeConversation.recipientProfile?.displayName?.[0] || 'U'))}
                  </div>
                  {!activeConversation.isProject && activeConversation.recipientProfile?.status === 'online' && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#0ed145] border-2 border-[#202c33] rounded-full" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-[#e9edef] text-base leading-tight">
                    {activeConversation.isProject ? (activeConversation.project?.businessName || 'Project Team') : (activeConversation.recipientProfile?.email === 'workzy59@gmail.com' ? 'Webby Launch' : (activeConversation.recipientProfile?.displayName || 'User'))}
                  </h3>
                  <div className="flex items-center gap-2">
                    {typingUsers.length > 0 ? (
                      <p className="text-[11px] text-[#00a884] font-medium animate-pulse">typing...</p>
                    ) : (
                      <p className="text-[11px] text-[#8696a0]">
                        {activeConversation.isProject ? 'Direct Support channel' : (activeConversation.recipientProfile?.status === 'online' ? 'Online' : `last seen today at ${activeConversation.recipientProfile?.lastSeen ? formatDate(activeConversation.recipientProfile.lastSeen, 'h:mm a') : 'recently'}`)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[#aebac1]">
                 <button className="p-2 hover:bg-white/5 rounded-lg transition-all flex items-center">
                    <Video size={20} />
                    <ChevronDown size={14} className="ml-1 opacity-50" />
                 </button>
                 <button className="p-2 hover:bg-white/5 rounded-lg transition-all">
                    <Search size={20} />
                 </button>
                 <button className="p-2 hover:bg-white/5 rounded-lg transition-all">
                    <MoreVertical size={20} />
                 </button>
              </div>
            </header>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 md:px-10 py-6 md:py-10 space-y-3 relative z-10 custom-scrollbar scroll-smooth"
            >
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full space-y-10">
                  <div className="w-24 h-24 bg-[#202c33] rounded-full flex items-center justify-center opacity-20 transform scale-110">
                    <MessageSquare size={40} className="text-[#8696a0]" />
                  </div>
                  <div className="text-center space-y-4">
                    <h3 className="text-2xl font-light text-[#e9edef] opacity-60">Beginning of Chat</h3>
                    <p className="text-sm text-[#8696a0] max-w-[280px] mx-auto leading-relaxed">
                      Encrypted conversation with {activeConversation.isProject ? "Webby Launch" : activeConversation.recipientProfile?.displayName}.
                    </p>
                  </div>
                </div>
              ) : (
                renderMessages()
              )}
            </div>


            {/* Input Area */}
            <footer className="px-2 md:px-4 py-2 border-t border-[#ffffff05] bg-[#202c33] flex flex-col relative z-20 shrink-0">
               {/* Reply Preview */}
               <AnimatePresence>
                 {replyingTo && (
                   <motion.div 
                     initial={{ opacity: 0, height: 0 }}
                     animate={{ opacity: 1, height: 'auto' }}
                     exit={{ opacity: 0, height: 0 }}
                     className="px-4 py-2 border-l-4 border-[#34b7f1] bg-[#1e293b]/50 mb-2 flex items-center justify-between"
                   >
                     <div className="flex-1 min-w-0">
                       <p className="text-[10px] font-bold text-[#34b7f1] uppercase tracking-wider">Replying to {replyingTo.senderName}</p>
                       <p className="text-xs text-[#8696a0] truncate italic">{replyingTo.text}</p>
                     </div>
                     <button onClick={() => setReplyingTo(null)} className="p-1 hover:bg-white/10 rounded-full text-[#8696a0]">
                       <X size={14} />
                     </button>
                   </motion.div>
                 )}
               </AnimatePresence>

               {/* Mentions Dropdown */}
               <AnimatePresence>
                 {showMentions && mentionResults.length > 0 && (
                   <motion.div 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: 10 }}
                     className="absolute bottom-full left-4 right-4 bg-[#202c33] border border-white/5 rounded-xl shadow-2xl overflow-hidden mb-2 z-50"
                   >
                     <div className="px-4 py-2 bg-[#2a3942] flex items-center justify-between">
                       <span className="text-[10px] font-bold text-[#8696a0] uppercase tracking-widest">Mention a User</span>
                       {mentionLoading && <Loader2 size={12} className="animate-spin text-[#ffc107]" />}
                     </div>
                     <div className="max-h-48 overflow-y-auto">
                       {mentionResults.map(u => (
                         <button 
                           key={u.uid}
                           onClick={() => selectMention(u)}
                           className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 text-left transition-all"
                         >
                           <div className="w-8 h-8 rounded-full bg-[#3b4a54] flex items-center justify-center font-bold text-xs uppercase">
                             {u.displayName?.[0] || 'U'}
                           </div>
                           <div>
                             <p className="text-sm font-medium text-[#e9edef]">{u.displayName}</p>
                             <p className="text-[10px] text-[#8696a0]">@{u.username || u.uid.slice(0, 6)}</p>
                           </div>
                         </button>
                       ))}
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>

               <div className="flex items-center gap-2">
                 <div className="flex items-center">
                    <input 
                      type="file" 
                      id="file-upload" 
                      className="hidden" 
                      multiple 
                      onChange={(e) => handleFileUpload(e.target.files)} 
                    />
                    <label htmlFor="file-upload" className="p-2 text-[#aebac1] hover:text-[#e9edef] transition-all cursor-pointer">
                      <Plus size={24} />
                    </label>
                 </div>
                 
                 <button className="p-2 text-[#aebac1] hover:text-[#e9edef] transition-all">
                    <Smile size={24} />
                 </button>
                 
                 <form onSubmit={handleSendMessage} className="flex-1 flex items-center gap-2 min-w-0">
                    <div className="flex-1 relative min-w-0">
                      <input 
                        type="text"
                        value={inputText}
                        onChange={handleInputChange}
                        placeholder={editingMessage ? "Edit message..." : "Message"}
                        className="w-full bg-[#2a3942] border-none rounded-xl py-2 px-4 text-sm text-[#e9edef] placeholder:text-[#8696a0] outline-none"
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={isSending && inputText.trim() === ''}
                      className={`p-2.5 transition-all ${inputText.trim() ? 'text-[#00a884] scale-110' : 'text-[#aebac1]'}`}
                    >
                      {inputText.trim() ? <Send size={24} /> : <Mic size={24} />}
                    </button>
                 </form>
               </div>
            </footer>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-8 bg-[#222e35]">
             {/* ... */}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-[400] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 md:p-20 cursor-zoom-out"
          >
            <motion.img 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={selectedImage}
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
            />
            <button className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all">
              <X size={24} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Selection Modal */}
      <AnimatePresence>
        {showUserList && (
           <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="bg-[#111b21] rounded-2xl border border-white/5 w-full max-w-md overflow-hidden shadow-2xl"
             >
                <div className="p-6 border-b border-[#202c33] flex justify-between items-center bg-[#202c33]">
                   <h3 className="text-lg font-bold text-[#e9edef]">New Chat</h3>
                   <button onClick={() => setShowUserList(false)} className="p-2 hover:bg-white/5 rounded-full text-[#aebac1] transition-all">
                      <X size={20} />
                   </button>
                </div>
                
                <div className="max-h-[60vh] overflow-y-auto space-y-1 p-4 custom-scrollbar">
                   {allProfiles.length === 0 ? (
                     <div className="text-center py-10">
                        <p className="text-sm text-[#8696a0]">No results found.</p>
                     </div>
                   ) : (
                     allProfiles.map(u => (
                        <button 
                          key={u.uid}
                          onClick={() => startNewChat(u)}
                          className="w-full p-4 hover:bg-[#202c33] rounded-xl transition-all flex items-center gap-4 text-left"
                        >
                           <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${
                             u.email === 'workzy59@gmail.com' ? 'bg-[#ffc107] text-black' : 'bg-[#3b4a54] text-white'
                           }`}>
                              {u.displayName?.[0] || 'U'}
                           </div>
                           <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-[#e9edef] truncate">{u.displayName === 'SAI ROSHAN' ? 'System Support' : u.displayName}</h4>
                              <p className="text-xs text-[#8696a0] truncate">{u.role}</p>
                           </div>
                        </button>
                     ))
                   )}
                </div>
             </motion.div>
           </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
