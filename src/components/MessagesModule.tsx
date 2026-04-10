import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  X, 
  Check, 
  CheckCheck, 
  Image as ImageIcon, 
  Paperclip, 
  Search,
  Phone,
  Video,
  MessageCircle,
  MoreVertical,
  Smile,
  FileText,
  ChevronLeft,
  Briefcase,
  User as UserIcon,
  Circle,
  Sparkles,
  ArrowLeft,
  Trash2
} from 'lucide-react';
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
      className={`w-6 h-6 border-2 border-${color === 'white' ? 'white' : '[#E6FF00]'} border-t-transparent rounded-full`}
    />
    <span className={`text-[10px] font-black uppercase tracking-[0.2em] text-${color === 'white' ? 'white' : '[#E6FF00]'} animate-pulse italic`}>Loading...</span>
  </div>
);
import { FirebaseUser } from '../firebase';
import { UserProfile, Message, Project } from '../types';
import { 
  sendDirectMessage, 
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
  markMessageAsSeen as markMsgSeen
} from '../services/database';
import { formatDate, isSameDay } from '../lib/utils';
import ChatSystem from './ChatSystem';

interface MessagesModuleProps {
  currentUser: FirebaseUser;
  profile: UserProfile | null;
  onClose: () => void;
  fullScreen?: boolean;
  projects?: Project[];
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

export default function MessagesModule({ currentUser, profile, onClose, fullScreen = true, projects = [] }: MessagesModuleProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
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
        
        // Filter conversations as well for non-admins
        let finalConvs = enrichedConvs;
        if (profile?.role !== 'admin') {
          // Users should see conversations with admins OR conversations they are part of
          finalConvs = enrichedConvs.filter(c => c.recipientProfile?.role === 'admin' || c.participants.includes(currentUser.uid));
        }
        
        // Add project conversations
        const projectConvs: Conversation[] = projects.map(p => ({
          id: p.id,
          lastMessage: p.lastMessage || 'Project Chat',
          lastMessageAt: p.lastMessageAt || p.createdAt,
          lastSenderId: p.lastSenderId || '',
          participants: [p.userId, p.developerId].filter(Boolean) as string[],
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

    if (activeConversation.isProject) return;

    const recipientId = activeConversation.participants.find(id => id !== currentUser.uid);
    if (!recipientId) return;

    const unsubMessages = getDirectMessages(currentUser.uid, recipientId, (messagesData) => {
      const newMessages = (messagesData as Message[]).filter(m => !m.hiddenFor?.includes(currentUser.uid));
      setMessages(newMessages);

      // Mark as delivered if recipient receives it
      newMessages.forEach(async (m) => {
        if (m.senderId !== currentUser.uid && m.status === 'sent') {
          await markMessageAsDelivered(m.id, activeConversation.id);
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
    if (!inputText.trim() || !activeConversation || isSending || activeConversation.isProject) return;

    const recipientId = activeConversation.participants.find(id => id !== currentUser.uid);
    if (!recipientId) return;

    setIsSending(true);
    try {
      await sendDirectMessage(recipientId, {
        senderId: currentUser.uid,
        senderName: currentUser.displayName || profile?.displayName || 'User',
        text: inputText,
        status: 'sent',
      });
      setInputText('');
      // Clear typing status
      if (activeConversation.id !== 'new') {
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
    if (c.isProject) {
      return c.project?.businessName.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return c.recipientProfile?.displayName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const renderMessages = () => {
    const filteredMessages = messageSearchQuery
      ? messages.filter(m => m.text.toLowerCase().includes(messageSearchQuery.toLowerCase()))
      : messages;

    return filteredMessages.map((m, idx) => {
      const isMe = m.senderId === currentUser.uid;
      const showDate = idx === 0 || (m.createdAt && messages[idx - 1].createdAt && !isSameDay(m.createdAt, messages[idx - 1].createdAt));
      
      return (
        <React.Fragment key={m.id}>
          {showDate && (
            <div className="flex justify-center my-6">
              <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black text-white/60 uppercase tracking-widest border border-white/5 shadow-lg">
                {formatDate(m.createdAt, 'separator')}
              </span>
            </div>
          )}
          <div className={`flex items-end gap-2 mb-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] md:max-w-[70%]`}>
              <div className={`relative p-3 rounded-2xl text-sm font-medium leading-relaxed shadow-xl ${
                isMe 
                  ? 'bg-[#005c4b] text-white rounded-tr-none' 
                  : 'bg-[#202c33] text-white border border-white/5 rounded-tl-none'
              }`}>
                {m.isDeleted ? (
                  <p className="text-[10px] italic text-white/40 flex items-center gap-2">
                    <Trash2 size={12} />
                    This message was deleted
                  </p>
                ) : (
                  <>
                    {!isMe && activeConversation.isProject && (
                      <p className="text-[10px] font-black text-[#E6FF00] uppercase tracking-widest mb-1">
                        {m.senderName}
                      </p>
                    )}
                    {m.text}
                  </>
                )}
                <div className={`flex items-center gap-1.5 mt-1 justify-end ${isMe ? 'opacity-60' : 'opacity-40'}`}>
                  <span className="text-[9px] font-bold uppercase tracking-widest">
                    {formatDate(m.createdAt, 'chat')}
                  </span>
                  {isMe && (
                    <span>
                      {m.status === 'seen' ? (
                        <CheckCheck size={14} className="text-[#53bdeb]" />
                      ) : m.status === 'delivered' ? (
                        <CheckCheck size={14} className="text-white/60" />
                      ) : (
                        <Check size={14} className="text-white/40" />
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
    ? "fixed inset-0 z-[200] bg-[#020617] flex flex-col md:flex-row overflow-hidden font-sans"
    : "relative w-full h-[calc(100vh-180px)] bg-[#020617]/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row overflow-hidden font-sans shadow-2xl";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={containerClasses}
    >
      {/* Sidebar / List View */}
      <div className={`w-full md:w-96 border-r border-white/5 flex flex-col bg-slate-900/40 backdrop-blur-3xl ${activeConversation ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Messages</h2>
          <button 
            onClick={onClose}
            className={`p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-all ${!fullScreen ? 'lg:hidden' : ''}`}
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <input 
              type="text"
              placeholder="Search chats..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white outline-none focus:border-[#E6FF00]/50 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader color="white" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-10 text-center space-y-6">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                <MessageCircle className="text-white/10" size={40} />
              </div>
              <div className="space-y-2">
                <p className="text-white/60 text-sm font-black uppercase italic tracking-tight">No conversations yet</p>
                <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                  {profile?.role === 'admin' 
                    ? 'Start a conversation with one of your clients or developers.' 
                    : 'Need help? Start a conversation with our support team.'}
                </p>
              </div>
              <button 
                onClick={profile?.role === 'admin' ? () => setShowUserList(true) : handleMessageAdmin}
                className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[#E6FF00] text-[10px] font-black uppercase tracking-widest hover:bg-[#E6FF00] hover:text-black hover:border-transparent transition-all"
              >
                {profile?.role === 'admin' ? 'Start a new chat' : 'Message Admin'}
              </button>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveConversation(conv)}
                className={`w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-all border-b border-white/5 ${activeConversation?.id === conv.id ? 'bg-white/10' : ''}`}
              >
                <div className="relative">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center text-black font-black text-xl shadow-lg ${
                    conv.isProject 
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-600' 
                      : 'bg-gradient-to-br from-[#E6FF00] to-yellow-600'
                  }`}>
                    {conv.isProject ? <Briefcase size={24} /> : (conv.recipientProfile?.displayName?.[0] || 'U')}
                  </div>
                  {!conv.isProject && (
                    <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-[#020617] rounded-full ${
                      conv.recipientProfile?.status === 'online' ? 'bg-green-500' : 
                      conv.recipientProfile?.status === 'away' ? 'bg-yellow-500' : 'bg-gray-500'
                    }`}></div>
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-black text-white truncate uppercase tracking-tight text-sm">
                      {conv.isProject ? conv.project?.businessName : conv.recipientProfile?.displayName}
                    </span>
                    <span className="text-[10px] text-white/30 font-bold shrink-0">
                      {conv.lastMessageAt ? formatDate(conv.lastMessageAt, 'h:mm a') : ''}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-white/40 truncate font-medium pr-2 italic">
                      {conv.lastSenderId === currentUser.uid ? 'You: ' : ''}{conv.lastMessage}
                    </p>
                    {conv.unreadCount?.[currentUser.uid] ? (
                      <div className="bg-green-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)] shrink-0">
                        {conv.unreadCount[currentUser.uid]}
                      </div>
                    ) : null}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={() => setShowUserList(true)}
            className="w-full py-4 bg-[#E6FF00] text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_30px_rgba(230,255,0,0.2)]"
          >
            New Message
          </button>
        </div>
      </div>

      {/* Main Chat View */}
      <div className={`flex-1 flex flex-col bg-slate-900/20 backdrop-blur-xl relative ${!activeConversation ? 'hidden md:flex' : 'flex'}`}>
        {activeConversation ? (
          activeConversation.isProject ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              <header className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5 backdrop-blur-md">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setActiveConversation(null)}
                    className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white md:hidden"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-black font-black text-lg">
                    <Briefcase size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-white uppercase tracking-tight">{activeConversation.project?.businessName}</h3>
                    <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest flex items-center gap-1.5">
                      Project Chat
                    </p>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="p-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all hidden md:block"
                >
                  <X size={20} />
                </button>
              </header>
              <div className="flex-1 overflow-hidden">
                <ChatSystem 
                  projectId={activeConversation.project?.id || ''} 
                  user={currentUser} 
                  profile={profile} 
                  currentUser={currentUser} 
                />
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
            <header className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setActiveConversation(null)}
                  className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white md:hidden"
                >
                  <ChevronLeft size={24} />
                </button>
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E6FF00] to-yellow-600 flex items-center justify-center text-black font-black text-lg">
                    {activeConversation.recipientProfile?.displayName?.[0] || 'U'}
                  </div>
                  <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-[#020617] rounded-full ${
                    activeConversation.recipientProfile?.status === 'online' ? 'bg-green-500' : 
                    activeConversation.recipientProfile?.status === 'away' ? 'bg-yellow-500' : 'bg-gray-500'
                  }`}></div>
                </div>
                <div>
                  <h3 className="font-black text-white uppercase tracking-tight">{activeConversation.recipientProfile?.displayName}</h3>
                  <div className="flex items-center gap-2">
                    {typingUsers.length > 0 ? (
                      <p className="text-[10px] text-[#E6FF00] font-black uppercase tracking-widest animate-pulse">typing...</p>
                    ) : (
                      <p className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                        activeConversation.recipientProfile?.status === 'online' ? 'text-green-400' : 'text-white/30'
                      }`}>
                        {activeConversation.recipientProfile?.status === 'online' ? (
                          <>
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            Active Now
                          </>
                        ) : (
                          `Last seen ${activeConversation.recipientProfile?.lastSeen ? formatDate(activeConversation.recipientProfile.lastSeen, 'MMM d, h:mm a') : 'recently'}`
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link 
                  to="/" 
                  className="p-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2 mr-2"
                >
                  <ArrowLeft size={14} /> Back to Webby
                </Link>
                <button 
                  onClick={() => setShowSearch(!showSearch)}
                  className={`p-3 rounded-xl transition-all ${showSearch ? 'bg-[#E6FF00] text-black' : 'hover:bg-white/5 text-white/40 hover:text-white'}`}
                >
                  <Search size={20} />
                </button>
                <button className="p-3 hover:bg-white/5 rounded-xl text-white/40 hover:text-white transition-all">
                  <Phone size={20} />
                </button>
                <button className="p-3 hover:bg-white/5 rounded-xl text-white/40 hover:text-white transition-all">
                  <Video size={20} />
                </button>
                <div className="w-[1px] h-8 bg-white/5 mx-2"></div>
                <button 
                  onClick={onClose}
                  className="p-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all hidden md:block"
                >
                  <X size={20} />
                </button>
              </div>
            </header>

            {showSearch && (
              <div className="p-4 bg-slate-900/40 border-b border-white/5 animate-in slide-in-from-top duration-300">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                  <input 
                    type="text"
                    placeholder="Search messages..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-white outline-none focus:border-[#E6FF00]/30 transition-all"
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
              className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide bg-[#0b141a] relative"
              style={{
                backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
                backgroundRepeat: 'repeat',
                backgroundSize: '400px',
                backgroundBlendMode: 'overlay',
                backgroundColor: '#0b141a'
              }}
            >
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full space-y-6">
                  <div className="w-24 h-24 bg-[#E6FF00]/10 rounded-full flex items-center justify-center relative">
                    <MessageCircle size={48} className="text-[#E6FF00]" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#E6FF00] rounded-full flex items-center justify-center text-black">
                      <Sparkles size={14} />
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">Start a Conversation</h3>
                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest max-w-[200px] leading-relaxed">
                      Send a message to begin your project journey with us.
                    </p>
                  </div>
                </div>
              )}
              {renderMessages()}
              {typingUsers.length > 0 && (
                <div className="flex items-center gap-2 text-[10px] text-[#E6FF00] font-black uppercase tracking-widest italic animate-pulse">
                  <div className="flex gap-1">
                    <span className="w-1 h-1 bg-[#E6FF00] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1 h-1 bg-[#E6FF00] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1 h-1 bg-[#E6FF00] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                  {activeConversation.recipientProfile?.displayName} is typing
                </div>
              )}
            </div>

            {/* Input Area */}
            <footer className="p-6 bg-white/5 border-t border-white/5">
              <form onSubmit={handleSendMessage} className="flex items-center gap-4 max-w-4xl mx-auto">



                <div className="flex-1 relative">
                  <input 
                    type="text"
                    placeholder="Type a message..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-6 pr-14 py-4 text-sm text-white outline-none focus:border-[#E6FF00]/50 transition-all"
                    value={inputText}
                    onChange={handleInputChange}
                  />
                  <button 
                    type="submit"
                    disabled={!inputText.trim() || isSending}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-xl transition-all ${
                      inputText.trim() && !isSending 
                        ? 'bg-[#E6FF00] text-black shadow-lg shadow-[#E6FF00]/20' 
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
            </>
          )
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-white/20 space-y-6">
              <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center">
                <MessageCircle size={48} strokeWidth={1.5} className="text-[#E6FF00]" />
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
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white outline-none focus:border-[#E6FF00]/50 transition-all"
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
                        user.status === 'away' ? 'bg-yellow-500' : 'bg-gray-500'
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
