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
  Loader2
} from 'lucide-react';
import { FirebaseUser } from '../firebase';
import { UserProfile, Message } from '../types';
import { 
  sendDirectMessage, 
  getDirectMessages, 
  updateDirectMessage,
  getConversations,
  getProfiles
} from '../services/database';
import { formatDate } from '../lib/utils';

interface MessagesModuleProps {
  currentUser: FirebaseUser;
  profile: UserProfile | null;
  onClose: () => void;
}

interface Conversation {
  id: string;
  lastMessage: string;
  lastMessageAt: any;
  lastSenderId: string;
  participants: string[];
  unreadCount?: number;
  recipientProfile?: UserProfile;
}

export default function MessagesModule({ currentUser, profile, onClose }: MessagesModuleProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>([]);
  const [showUserList, setShowUserList] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const notificationSound = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    notificationSound.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
    
    const fetchProfiles = async () => {
      const profiles = await getProfiles();
      let filteredProfiles = profiles.filter(p => p.uid !== currentUser.uid) as UserProfile[];
      
      // Messaging Restriction: Developers and Clients can only message Admin
      if (profile?.role !== 'admin') {
        filteredProfiles = filteredProfiles.filter(p => p.role === 'admin');
      }
      
      setAllProfiles(filteredProfiles);
    };
    fetchProfiles();

    const unsubConversations = getConversations(async (convs) => {
      const enrichedConvs = await Promise.all(convs.map(async (conv) => {
        const recipientId = conv.participants.find((id: string) => id !== currentUser.uid);
        const recipientProfile = await getProfiles().then(profiles => profiles.find(p => p.uid === recipientId));
        return { ...conv, recipientProfile };
      }));
      
      // Filter conversations as well for non-admins
      let finalConvs = enrichedConvs;
      if (profile?.role !== 'admin') {
        finalConvs = enrichedConvs.filter(c => c.recipientProfile?.role === 'admin');
      }
      
      setConversations(finalConvs as Conversation[]);
      setIsLoading(false);
    });

    return () => unsubConversations?.();
  }, [currentUser.uid, profile?.role]);

  useEffect(() => {
    if (!activeConversation) return;

    const recipientId = activeConversation.participants.find(id => id !== currentUser.uid);
    if (!recipientId) return;

    const unsubMessages = getDirectMessages(recipientId, (messagesData) => {
      const newMessages = messagesData as Message[];
      
      // Check for new incoming messages to play sound
      if (messages.length > 0 && newMessages.length > messages.length) {
        const lastMsg = newMessages[newMessages.length - 1];
        if (lastMsg.senderId !== currentUser.uid) {
          notificationSound.current?.play().catch(() => {});
        }
      }
      
      setMessages(newMessages);
      
      // Mark as seen
      newMessages.forEach(async (m) => {
        if (m.senderId !== currentUser.uid && !m.seen) {
          await updateDirectMessage(recipientId, m.id, { seen: true });
        }
      });
    });

    return () => unsubMessages?.();
  }, [activeConversation, currentUser.uid]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConversation || isSending) return;

    const recipientId = activeConversation.participants.find(id => id !== currentUser.uid);
    if (!recipientId) return;

    setIsSending(true);
    try {
      await sendDirectMessage(recipientId, {
        senderId: currentUser.uid,
        senderName: currentUser.displayName || profile?.displayName || 'User',
        text: inputText,
      });
      setInputText('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const startNewChat = (user: UserProfile) => {
    const existingConv = conversations.find(c => c.participants.includes(user.uid));
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

  const filteredConversations = conversations.filter(c => 
    c.recipientProfile?.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-[#020617] flex flex-col md:flex-row overflow-hidden font-sans"
    >
      {/* Sidebar / List View */}
      <div className={`w-full md:w-96 border-r border-white/5 flex flex-col bg-slate-900/40 backdrop-blur-3xl ${activeConversation ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Messages</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-all"
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
              <Loader2 className="text-[#E6FF00] animate-spin" size={32} />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-10 text-center space-y-4">
              <MessageCircle className="mx-auto text-white/10" size={48} />
              <p className="text-white/40 text-sm font-bold">No conversations yet</p>
              <button 
                onClick={() => setShowUserList(true)}
                className="text-[#E6FF00] text-xs font-black uppercase tracking-widest hover:underline"
              >
                Start a new chat
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
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#E6FF00] to-yellow-600 flex items-center justify-center text-black font-black text-xl shadow-lg">
                    {conv.recipientProfile?.displayName?.[0] || 'U'}
                  </div>
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-[#020617] rounded-full"></div>
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-black text-white truncate uppercase tracking-tight text-sm">{conv.recipientProfile?.displayName}</span>
                    <span className="text-[10px] text-white/30 font-bold shrink-0">
                      {conv.lastMessageAt ? formatDate(conv.lastMessageAt, 'h:mm a') : ''}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-white/40 truncate font-medium pr-2">
                      {conv.lastSenderId === currentUser.uid ? 'You: ' : ''}
                      {conv.lastMessage}
                    </p>
                    {conv.unreadCount && conv.unreadCount > 0 && (
                      <div className="bg-green-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)] shrink-0">
                        {conv.unreadCount}
                      </div>
                    )}
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
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E6FF00] to-yellow-600 flex items-center justify-center text-black font-black text-lg">
                  {activeConversation.recipientProfile?.displayName?.[0] || 'U'}
                </div>
                <div>
                  <h3 className="font-black text-white uppercase tracking-tight">{activeConversation.recipientProfile?.displayName}</h3>
                  <p className="text-[10px] text-green-400 font-black uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    Online
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
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

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide"
            >
              {messages.map((m, idx) => {
                const isMe = m.senderId === currentUser.uid;
                const showAvatar = idx === 0 || messages[idx - 1].senderId !== m.senderId;
                
                return (
                  <div key={m.id} className={`flex items-end gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    {!isMe && (
                      <div className="w-8 h-8 rounded-full bg-white/10 flex-shrink-0 flex items-center justify-center text-[10px] font-black">
                        {showAvatar ? m.senderName?.[0] : ''}
                      </div>
                    )}
                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[80%] md:max-w-[60%]`}>
                      <div className={`p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-lg ${
                        isMe 
                          ? 'bg-[#E6FF00] text-black rounded-br-none' 
                          : 'bg-white/5 text-white border border-white/10 rounded-bl-none'
                      }`}>
                        {m.text}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 px-1">
                        <span className="text-[9px] text-white/30 font-bold uppercase tracking-widest">
                          {m.createdAt ? formatDate(m.createdAt, 'h:mm a') : 'Sending...'}
                        </span>
                        {isMe && (
                          <span className="text-white/30">
                            {m.seen ? (
                              <CheckCheck size={12} className="text-[#E6FF00]" />
                            ) : (
                              <Check size={12} />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Area */}
            <footer className="p-6 bg-white/5 border-t border-white/5">
              <form onSubmit={handleSendMessage} className="flex items-center gap-4 max-w-4xl mx-auto">
                <div className="flex gap-2">
                  <button type="button" className="p-3 hover:bg-white/5 rounded-xl text-white/40 hover:text-white transition-all">
                    <Paperclip size={20} />
                  </button>
                  <button type="button" className="p-3 hover:bg-white/5 rounded-xl text-white/40 hover:text-white transition-all">
                    <ImageIcon size={20} />
                  </button>
                </div>
                <div className="flex-1 relative">
                  <input 
                    type="text"
                    placeholder="Type a message..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:border-[#E6FF00]/50 transition-all"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                  <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-all">
                    <Smile size={20} />
                  </button>
                </div>
                <button 
                  type="submit"
                  disabled={!inputText.trim() || isSending}
                  className="p-4 bg-[#E6FF00] text-black rounded-2xl hover:scale-105 active:scale-95 disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(230,255,0,0.2)]"
                >
                  <Send size={20} />
                </button>
              </form>
            </footer>
          </>
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
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white font-black">
                      {user.displayName?.[0] || 'U'}
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
