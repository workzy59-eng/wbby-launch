import React, { useState, useEffect, useRef } from 'react';
import { db, collection, query, orderBy, onSnapshot, FirebaseUser } from '../firebase';
import { UserProfile, Message } from '../types';
import { Send, Paperclip, Check, CheckCheck, MessageCircle, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';
import { sendMessage, updateMessage, getMessages, getDirectMessages, sendDirectMessage, updateDirectMessage, deleteMessage, deleteDirectMessage } from '../services/database';
import { formatDate } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface ChatSystemProps {
  projectId?: string;
  isDirect?: boolean;
  user: FirebaseUser; // For direct chat, this is the user the admin is chatting with, or the current user if client
  profile: UserProfile | null;
  currentUser?: FirebaseUser; // The actual logged in user
}

export default function ChatSystem({ projectId, isDirect, user, profile, currentUser }: ChatSystemProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const effectiveCurrentUser = currentUser || user;

  useEffect(() => {
    let unsubscribe: () => void;

    if (isDirect) {
      unsubscribe = getDirectMessages(user.uid, (messagesData) => {
        // Filter out messages hidden for current user
        const filtered = (messagesData as any[]).filter(m => !m.hiddenFor?.includes(effectiveCurrentUser.uid));
        setMessages(filtered as Message[]);
        
        // Mark as seen
        messagesData.forEach(async (m) => {
          if (m.senderId !== effectiveCurrentUser.uid && !m.seen) {
            await updateDirectMessage(user.uid, m.id, { seen: true });
          }
        });
      });
    } else if (projectId) {
      unsubscribe = getMessages(projectId, (messagesData) => {
        // Filter out messages hidden for current user
        const filtered = (messagesData as any[]).filter(m => !m.hiddenFor?.includes(effectiveCurrentUser.uid));
        setMessages(filtered as Message[]);
        
        // Mark as seen
        messagesData.forEach(async (m) => {
          if (m.senderId !== effectiveCurrentUser.uid && !m.seen) {
            await updateMessage(projectId, m.id, { seen: true });
          }
        });
      });
    }

    return () => unsubscribe?.();
  }, [projectId, isDirect, user.uid, effectiveCurrentUser.uid]);

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
      if (isDirect) {
        await sendDirectMessage(user.uid, {
          senderId: effectiveCurrentUser.uid,
          senderName: effectiveCurrentUser.displayName || 'Admin',
          text: inputText,
        });
      } else if (projectId) {
        await sendMessage(projectId, {
          senderId: effectiveCurrentUser.uid,
          senderName: effectiveCurrentUser.displayName || 'Admin',
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

  const handleDelete = async (forEveryone: boolean) => {
    if (!selectedMessage) return;

    try {
      if (isDirect) {
        await deleteDirectMessage(user.uid, selectedMessage.id, forEveryone, effectiveCurrentUser.uid);
      } else if (projectId) {
        await deleteMessage(projectId, selectedMessage.id, forEveryone, effectiveCurrentUser.uid);
      }
      setSelectedMessage(null);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#4A5D4E] font-sans relative">
      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white/20 space-y-6">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
              <MessageCircle size={40} strokeWidth={1.5} className="text-[#E6FF00]" />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.3em]">Secure Channel Established</p>
          </div>
        ) : (
          messages.map((m) => (
            <div 
              key={m.id} 
              className={`flex gap-4 ${m.senderId === effectiveCurrentUser.uid ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Profile Photo / Logo */}
              <div className="flex-shrink-0 mt-1">
                {m.senderId === effectiveCurrentUser.uid ? (
                  <div className="w-10 h-10 rounded-full bg-[#E6FF00] flex items-center justify-center text-[#4A5D4E] font-black italic text-xs">
                    {m.senderName?.[0] || 'U'}
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#E6FF00] flex items-center justify-center border border-white/10 overflow-hidden">
                    <span className="text-black font-black text-[6px] tracking-tighter leading-none text-center">W-E-B-i-L-A-U-N-C-H</span>
                  </div>
                )}
              </div>

              <div className={`flex flex-col ${m.senderId === effectiveCurrentUser.uid ? 'items-end' : 'items-start'}`}>
                <motion.div 
                  layout
                  onClick={() => !m.isDeleted && setSelectedMessage(m)}
                  className={`max-w-[85%] p-5 rounded-[2rem] text-sm font-medium shadow-2xl backdrop-blur-md border cursor-pointer transition-all ${
                    m.senderId === effectiveCurrentUser.uid 
                      ? 'bg-[#E6FF00] text-black border-[#E6FF00]/20 rounded-tr-none' 
                      : 'bg-white/5 text-white border-white/10 rounded-tl-none'
                  } ${m.isDeleted ? 'italic opacity-50 cursor-default' : ''}`}
                >
                  {m.text}
                </motion.div>
                <div className="flex items-center gap-3 mt-3 px-2">
                  <span className="text-[9px] text-white/30 font-bold uppercase tracking-widest">
                    {m.createdAt ? formatDate(m.createdAt, 'h:mm a') : 'Sending...'}
                  </span>
                  {m.senderId === effectiveCurrentUser.uid && (
                    <span className="text-white/30">
                      {m.seen ? <CheckCheck size={12} className="text-[#E6FF00]" /> : <Check size={12} />}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Options Modal */}
      <AnimatePresence>
        {selectedMessage && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#5E7162] p-8 rounded-[2rem] border border-white/10 w-full max-w-xs shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white tracking-tight">Delete Message?</h3>
                <button onClick={() => setSelectedMessage(null)} className="text-white/40 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-3">
                {selectedMessage.senderId === effectiveCurrentUser.uid && (
                  <button 
                    onClick={() => handleDelete(true)}
                    className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} /> Delete for everyone
                  </button>
                )}
                <button 
                  onClick={() => handleDelete(false)}
                  className="w-full py-4 bg-white/5 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} /> Delete for me
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <form 
        onSubmit={handleSendMessage}
        className="p-8 border-t border-white/5 bg-[#4A5D4E]"
      >
        <div className="flex items-center gap-4 bg-black/20 p-2 rounded-full border border-white/10 focus-within:border-[#E6FF00]/50 transition-all">
          <button 
            type="button"
            className="p-4 text-white/40 hover:text-[#E6FF00] transition-all"
          >
            <Paperclip size={20} />
          </button>
          <input 
            type="text" 
            placeholder="Type your message..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium py-3 text-white placeholder:text-white/20"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button 
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="p-4 bg-[#E6FF00] text-black rounded-full hover:scale-105 active:scale-95 disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(230,255,0,0.2)]"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}
