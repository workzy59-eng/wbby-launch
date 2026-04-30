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
  ExternalLink,
  Reply,
  Download,
  Star
} from 'lucide-react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import EmojiPicker, { Theme as EmojiTheme } from 'emoji-picker-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { StopCircle, Play, Pause, Trash2 as TrashIcon, Headphones } from 'lucide-react';

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
  getMessages, 
  updateDirectMessage,
  getConversations,
  getProfiles,
  getAdmins,
  getUserProfile,
  getProjectsAsync,
  setUserTyping,
  getTypingStatus,
  uploadFile,
  markConversationAsSeen,
  markProjectAsSeen,
  markMessageAsDelivered,
  markMessageAsSeen,
  deleteDirectMessage,
  toggleDirectMessageReaction,
  toggleMessageReaction,
  searchUsers,
  toggleFavoriteConversation
} from '../services/database';
import { formatDate, isSameDay } from '../lib/utils';
import ChatSystem from './ChatSystem';
import FilePreviewEditor from './chat/FilePreviewEditor';
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
  
  const getEffectiveSenderName = () => {
    if (profile?.role === 'developer' && activeConversation?.recipientProfile?.role === 'client') {
      return 'Webby Launch';
    }
    return currentUser.displayName || profile?.displayName || 'User';
  };
  
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
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>([]);
  const [showUserList, setShowUserList] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminProfile, setAdminProfile] = useState<UserProfile | null>(null);
  const [assignedDeveloper, setAssignedDeveloper] = useState<UserProfile | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [messageSearchQuery, setMessageSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [previewImage, setPreviewImage] = useState<File | null>(null);
  const [reactionAnchor, setReactionAnchor] = useState<{ x: number, y: number, messageId: string } | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const handleLongPressStart = (messageId: string, x: number, y: number) => {
    longPressTimer.current = setTimeout(() => {
      setReactionAnchor({ x, y, messageId });
    }, 500);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  // New states for voice messages
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

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
      
      // Messaging Restriction: 
      // Admin: Can message everyone
      // Developer: Can message Admin and Clients
      // Client: Can ONLY message their assigned Developer (enforced below in conversations)
      if (profile?.role === 'developer') {
        filteredProfiles = filteredProfiles.filter(p => p.role === 'admin' || p.role === 'client');
      } else if (profile?.role === 'client') {
        // Clients don't see anyone in the search list, they only use the pre-created dev convo
        filteredProfiles = [];
      } else if (profile?.role !== 'admin') {
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

        // Fetch projects to include in conversations
        const userProjects = projects.length > 0 ? projects : (await getProjectsAsync(currentUser.uid, profile?.role));
        const projectConvs = userProjects.map(p => ({
          id: p.id,
          lastMessage: p.lastMessage || 'Project channel active',
          lastMessageAt: p.lastMessageAt || p.createdAt,
          lastSenderId: p.lastSenderId || '',
          participants: [p.userId, p.developerId].filter(Boolean) as string[],
          unreadCount: p.unreadCount || {},
          isProject: true,
          project: p
        }));

        // Merge both
        let allEnriched = [...enrichedConvs, ...projectConvs];

        // Filter out admin conversations for clients
        if (profile?.role === 'client') {
          allEnriched = allEnriched.filter(conv => {
            if (conv.isProject) return true; // Project conversations are okay (usually with dev)
            const recipientProfile = conv.recipientProfile;
            if (recipientProfile?.role === 'admin') return false;
            return true;
          });

          // Ensure they can see the Dev as separate support options if needed
          const activeProjWithDev = userProjects.find(p => p.assignedTo || p.developerId);
          let devProfile: UserProfile | null = null;
          
          if (activeProjWithDev) {
            const devId = activeProjWithDev.assignedTo || activeProjWithDev.developerId;
            if (devId) {
              const p = await getUserProfile(devId);
              if (p) {
                devProfile = p as UserProfile;
                setAssignedDeveloper(devProfile);
              }
            }
          }

          const admins = await getAdmins();
          const mainAdmin = admins.find(a => a.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) || admins[0];
          
          // 1. Developers/Admins see Support, Clients DO NOT as per request
          if (profile?.role !== 'client' && mainAdmin) {
            const adminConvExists = allEnriched.some(c => c.participants.includes(mainAdmin.uid));
            if (!adminConvExists) {
              allEnriched.push({
                id: 'new_admin',
                lastMessage: 'Contact Webby Launch Support',
                lastMessageAt: null,
                lastSenderId: '',
                participants: [currentUser.uid, mainAdmin.uid],
                recipientProfile: mainAdmin
              } as any);
            }
          }

          // 2. Ensure Developer is visible if assigned and no direct/project conversation already exists
          if (devProfile) {
            const devConvExists = allEnriched.some(c => c.participants.includes(devProfile!.uid) || c.id === activeProjWithDev!.id);
            if (!devConvExists) {
               allEnriched.push({
                id: 'new_dev',
                lastMessage: 'Message your Assigned Developer',
                lastMessageAt: null,
                lastSenderId: '',
                participants: [currentUser.uid, devProfile.uid],
                recipientProfile: devProfile
              } as any);
            }
          }
        }
        
        // Dedup: if a conversation exists for the same project, prefer the project one if it has more info, or just keep both?
        // Usually, the direct conversation between client and admin might be separate from the project chat.
        // But if they are the same participants, maybe we should group?
        // For now, keep them separate as 'Direct' vs 'Project'.

        // Sort by date
        const sortedConvs = allEnriched.sort((a, b) => {
          const dateA = a.lastMessageAt?.toMillis?.() || a.lastMessageAt || 0;
          const dateB = b.lastMessageAt?.toMillis?.() || b.lastMessageAt || 0;
          return dateB - dateA;
        });

        // Check for new messages to play sound
        setConversations(prev => {
          if (prev.length > 0) {
            const hasNewMessage = sortedConvs.some(newConv => {
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
          return sortedConvs as Conversation[];
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
    if (activeConversation.id !== 'new' && activeConversation.id !== 'new_admin' && activeConversation.id !== 'new_dev') {
      if (activeConversation.isProject) {
        markProjectAsSeen(activeConversation.id, currentUser.uid);
      } else {
        markConversationAsSeen(activeConversation.id, currentUser.uid);
      }
    }

    let unsub: () => void;
    let unsubTyping: () => void;

    if (activeConversation.isProject) {
      unsub = getMessages(activeConversation.id, (messagesData) => {
        const newMessages = (messagesData as Message[]).filter(m => !m.hiddenFor?.includes(currentUser.uid));
        setMessages(newMessages);

        // Mark individual messages as delivered/seen
        newMessages.forEach(async (m) => {
          if (m.senderId !== currentUser.uid) {
            if (m.status === 'sent') {
              await markMessageAsDelivered(m.id, undefined, activeConversation.id);
            }
            if (m.status !== 'seen') {
              await markMessageAsSeen(m.id, undefined, activeConversation.id);
            }
          }
        });
      });

      unsubTyping = getTypingStatus(activeConversation.id, (typing) => {
        setTypingUsers(typing.filter(uid => uid !== currentUser.uid));
      });
    } else {
      const recipientId = activeConversation.participants.find(id => id !== currentUser.uid);
      if (recipientId) {
        unsub = getDirectMessages(currentUser.uid, recipientId, (messagesData) => {
          const newMessages = (messagesData as Message[]).filter(m => !m.hiddenFor?.includes(currentUser.uid));
          setMessages(newMessages);

          // Mark as delivered or seen
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
        unsubTyping = getTypingStatus(activeConversation.id, (typing) => {
          setTypingUsers(typing.filter(uid => uid !== currentUser.uid));
        });
      }
    }

    return () => {
      unsub?.();
      unsubTyping?.();
    };
  }, [activeConversation?.id, currentUser.uid]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typingUsers]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !previewImage) || !activeConversation || isSending) return;

    const messageText = inputText.trim();
    const currentReplyingTo = replyingTo;
    const imageToUpload = previewImage;
    const currentMentions = mentions;
    
    setIsSending(true);
    try {
      let mediaUrl = null;
      let type = 'text';

      if (imageToUpload) {
        mediaUrl = await uploadFile(imageToUpload);
        type = 'image';
      }

      const senderName = getEffectiveSenderName();

      if (editingMessage) {
        const recipientId = activeConversation.participants.find(id => id !== currentUser.uid);
        if (recipientId) {
          await updateDirectMessage(recipientId, editingMessage.id, {
            text: messageText,
            edited: true,
            mentions: currentMentions,
            updatedAt: new Date()
          });
        }
        setEditingMessage(null);
      } else {
        const recipientId = activeConversation.participants.find(id => id !== currentUser.uid);
        const msgData = {
          senderId: currentUser.uid,
          senderName: senderName,
          text: messageText || (type === 'image' ? 'Sent a photo' : ''),
          status: 'sent',
          mentions: currentMentions,
          type: type,
          mediaUrl: mediaUrl,
          replyTo: currentReplyingTo ? {
            id: currentReplyingTo.id,
            text: currentReplyingTo.text,
            senderName: currentReplyingTo.senderName
          } : null
        };

        if ((activeConversation.id === 'new' || activeConversation.id === 'new_admin' || activeConversation.id === 'new_dev') && !activeConversation.isProject && recipientId) {
          await sendDirectMessage(recipientId, msgData);
        } else if (activeConversation.isProject) {
          await sendMessage(activeConversation.id, msgData);
        } else if (recipientId) {
          await sendDirectMessage(recipientId, msgData);
        }
        setReplyingTo(null);
      }
      setInputText('');
      setPreviewImage(null);
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

  const handleToggleReaction = async (messageId: string, emoji: string) => {
    if (!activeConversation) return;

    try {
      if (activeConversation.isProject) {
        await toggleMessageReaction(activeConversation.id, messageId, emoji, currentUser.uid);
      } else {
        const recipientId = activeConversation.participants.find(id => id !== currentUser.uid);
        if (recipientId) {
          await toggleDirectMessageReaction(recipientId, messageId, emoji, currentUser.uid);
        }
      }
    } catch (e) {
      console.error("Error toggling reaction:", e);
    }
    setShowReactionPicker(null);
  };

  const onEmojiClick = (emojiData: any) => {
    setInputText(prev => prev + emojiData.emoji);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm;codecs=opus' });
        const audioFile = new File([audioBlob], 'voice_message.webm', { type: 'audio/webm;codecs=opus' });

        if (recordingDuration < 1) {
          toast.error('Voice message too short');
          return;
        }

        try {
          setIsSending(true);
          const voiceUrl = await uploadFile(audioFile, 'voice_messages');
          
          if (activeConversation) {
            const messageData = {
              text: '🎤 Voice message',
              senderId: currentUser.uid,
              senderName: getEffectiveSenderName(),
              type: 'voice',
              mediaUrl: voiceUrl,
              duration: recordingDuration,
              replyTo: replyingTo ? {
                id: replyingTo.id,
                text: replyingTo.text,
                senderName: replyingTo.senderName
              } : null
            };

            const recipientId = activeConversation.participants.find(id => id !== currentUser.uid);
            if (activeConversation.isProject) {
              await sendMessage(activeConversation.id, messageData);
            } else if (recipientId) {
              await sendDirectMessage(recipientId, messageData);
            }
            setReplyingTo(null);
          }
        } catch (error) {
          console.error('Error sending voice message:', error);
          toast.error('Failed to send voice message');
        } finally {
          setIsSending(false);
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingDuration(0);
      
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };

  const cancelRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.onstop = null; // Prevent triggering send
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      toast('Recording canceled');
    }
  };

  const formatDuration = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
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

  const renderReactionPopup = () => {
    if (!reactionAnchor) return null;
    const reactions = ['👍', '❤️', '😂', '😮', '😢', '🔥', '🙏'];
    return (
      <div 
        className="fixed z-[100] bg-[#233138] p-2 rounded-full shadow-2xl flex gap-1 animate-in fade-in zoom-in duration-200 border border-white/10"
        style={{ left: Math.min(reactionAnchor.x, window.innerWidth - 300), top: reactionAnchor.y - 60 }}
      >
        {reactions.map(emoji => (
          <button 
            key={emoji}
            onClick={() => {
              handleToggleReaction(reactionAnchor.messageId, emoji);
              setReactionAnchor(null);
            }}
            className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-all text-xl"
          >
            {emoji}
          </button>
        ))}
        <div className="w-[1px] h-6 bg-white/10 my-auto mx-1" />
        <button 
          onClick={() => {
            const msg = messages.find(m => m.id === reactionAnchor.messageId);
            if (msg) setReplyingTo(msg);
            setReactionAnchor(null);
          }}
          className="p-2 hover:bg-white/10 rounded-full text-white/60"
        >
          <Reply size={18} />
        </button>
      </div>
    );
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

    if (m.type === 'voice') {
      return (
        <div className="flex items-center gap-3 py-2 px-1 min-w-[200px]">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              const audio = document.getElementById(`audio-${m.id}`) as HTMLAudioElement;
              if (audio) {
                if (audio.paused) {
                  audio.play().catch(err => {
                    console.error('Playback failed:', err);
                    toast.error('Voice playback error');
                  });
                } else {
                  audio.pause();
                }
              }
            }}
            className="w-10 h-10 bg-[#c7c42a] rounded-full flex items-center justify-center text-black shrink-0 hover:scale-105 active:scale-95 transition-all shadow-lg"
          >
            <Play size={20} className="ml-1" />
          </button>
          <div className="flex-1 min-w-0">
             <div className="flex flex-col gap-1.5">
                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden relative">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: '100%' }}
                     transition={{ duration: m.duration || 0, ease: 'linear' }}
                     className="h-full bg-[#c7c42a] absolute left-0 top-0 opacity-40" 
                   />
                   <div className="absolute inset-0 flex justify-between px-1">
                      {[...Array(12)].map((_, i) => (
                        <div key={i} className="w-[1px] h-full bg-white/20" />
                      ))}
                   </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black tracking-widest text-[#8696a0] uppercase">{formatDuration(m.duration || 0)}</span>
                  <Mic size={10} className="text-[#8696a0]" />
                </div>
             </div>
          </div>
          <audio 
            id={`audio-${m.id}`} 
            src={mediaUrl} 
            className="hidden" 
            onPlay={(e) => {
               // Update UI if needed
            }} 
            onError={() => {
              console.error('Audio load failed');
            }}
          />
        </div>
      );
    }

    return null;
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !activeConversation || isSending) return;
    
    const fileList = Array.from(files);
    const images = fileList.filter(f => f.type.startsWith('image/'));
    const others = fileList.filter(f => !f.type.startsWith('image/'));

    if (images.length > 0) {
      setPendingFiles(prev => [...prev, ...images]);
    }

    if (others.length > 0) {
      uploadNonImages(others);
    }
  };

  const uploadNonImages = async (files: File[]) => {
    if (!activeConversation) return;

    let recipientId = activeConversation.participants.find(id => id !== currentUser.uid);
    if (!recipientId && !activeConversation.isProject) return;

    setIsSending(true);
    
    try {
      for (let file of files) {
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`File ${file.name} is too large. Max 10MB.`);
          continue;
        }

        setUploadProgress(prev => ({ ...prev, [file.name]: 30 }));
        
        try {
          const url = await uploadFile(file);
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));

          const senderName = getEffectiveSenderName();

          const messageData = {
            senderId: currentUser.uid,
            senderName: senderName,
            text: `Shared ${file.name}`,
            type: 'file',
            mediaUrl: url,
            fileName: file.name,
            status: 'sent'
          };

          if (activeConversation.isProject) {
            await sendMessage(activeConversation.id, messageData);
          } else if (recipientId) {
            await sendDirectMessage(recipientId, messageData);
          }
        } catch (e) {
          console.error('Upload error:', e);
          toast.error(`Failed to upload ${file.name}`);
        }
      }
    } finally {
      setIsSending(false);
      setTimeout(() => setUploadProgress({}), 1000);
    }
  };

  const handleSendFromEditor = async (data: { file: File; caption: string }[]) => {
    if (!activeConversation) return;
    setPendingFiles([]);
    setIsSending(true);
    
    let recipientId = activeConversation.participants.find(id => id !== currentUser.uid);

    try {
      for (let item of data) {
        let file = item.file;
        
        // Compress images
        try {
          file = await imageCompression(file as any, { maxSizeMB: 1, maxWidthOrHeight: 1920 }) as any;
        } catch (e) { console.error(e); }

        setUploadProgress(prev => ({ ...prev, [file.name]: 30 }));
        
        try {
          const url = await uploadFile(file);
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));

          const messageData = {
            senderId: currentUser.uid,
            senderName: getEffectiveSenderName(),
            text: item.caption || 'Sent a photo',
            type: 'image',
            mediaUrl: url,
            fileName: file.name,
            status: 'sent'
          };

          if (activeConversation.isProject) {
            await sendMessage(activeConversation.id, messageData);
          } else if (recipientId) {
            await sendDirectMessage(recipientId, messageData);
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

  const handleMessageAdmin = async () => {
    setIsLoading(true);
    try {
      // Check if client has an assigned developer
      if (profile?.role === 'client') {
        const userProjects = projects.length > 0 ? projects : (await getProjectsAsync(currentUser.uid));
        const activeProjWithDev = userProjects.find(p => p.assignedTo || p.developerId);
        if (activeProjWithDev) {
          const devId = activeProjWithDev.assignedTo || activeProjWithDev.developerId;
          const devProfile = await getUserProfile(devId!);
          if (devProfile) {
            startNewChat(devProfile as UserProfile);
            return;
          }
        }
      }

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

  const toggleFavorite = async (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    const isNowFavorite = await toggleFavoriteConversation(currentUser.uid, conversationId);
    if (isNowFavorite) {
      toast.success('Added to favorites');
    } else {
      toast.success('Removed from favorites');
    }
  };

  const filteredConversations = conversations.filter(c => {
    // Search
    const searchLow = searchQuery.toLowerCase();
    const matchesSearch = c.isProject 
      ? (c.project?.businessName?.toLowerCase()?.includes(searchLow) ?? false)
      : (c.recipientProfile?.displayName?.toLowerCase()?.includes(searchLow) ?? false);
    
    if (!matchesSearch) return false;

    // Filter
    if (activeFilter === 'unread') {
      return (c.unreadCount?.[currentUser.uid] || 0) > 0;
    }
    
    if (activeFilter === 'favorites') {
      return profile?.favoriteConversations?.includes(c.id);
    }

    return true;
  });

  const renderMessages = () => {
    const searchLow = messageSearchQuery.toLowerCase();
    const filteredMessages = messageSearchQuery
      ? messages.filter(m => (m.text?.toLowerCase()?.includes(searchLow) ?? false))
      : messages;

    let lastDate = '';

    return filteredMessages.map((m, idx) => {
      const isMe = m.senderId === currentUser.uid;
      const messageDate = m.createdAt ? formatDate(m.createdAt, 'separator') : '';
      const showDate = messageDate !== lastDate;
      if (showDate) lastDate = messageDate;
      
      const isActionsVisible = showActions === m.id;
      const isFirstOfGroup = idx === 0 || messages[idx-1].senderId !== m.senderId;
      const isLastOfGroup = idx === messages.length - 1 || messages[idx+1].senderId !== m.senderId;
      
      return (
        <React.Fragment key={m.id}>
          {showDate && (
            <div className="flex justify-center my-8">
              <span className="text-[10px] font-black tracking-[0.2em] text-white/20 uppercase">
                {messageDate}
              </span>
            </div>
          )}
          <div 
            className={`flex items-end mb-1 group px-1 ${isMe ? 'justify-end' : 'justify-start'}`}
            onMouseEnter={() => setShowActions(m.id)}
            onMouseLeave={() => setShowActions(null)}
          >
            <div className={`flex items-end gap-2 max-w-[85%] md:max-w-[75%]`}>
              {!isMe && (
                <div className="w-7 h-7 mb-1 shrink-0">
                  {isLastOfGroup ? (
                    <div className="w-full h-full rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black uppercase overflow-hidden border border-white/5">
                      {activeConversation?.recipientProfile?.displayName?.[0] || 'U'}
                    </div>
                  ) : <div className="w-7" />}
                </div>
              )}

              <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} relative group/msg`}>
                <div 
                  className={`relative px-4 py-3 text-[14px] leading-relaxed shadow-lg transition-all ${
                  isMe 
                    ? 'bg-[#3b82f6] text-white' 
                    : 'bg-[#262626] text-white'
                } ${
                  isMe 
                    ? `rounded-[20px] ${isLastOfGroup ? 'rounded-br-sm' : ''} ${!isFirstOfGroup ? 'rounded-tr-2xl' : ''}` 
                    : `rounded-[20px] ${isLastOfGroup ? 'rounded-bl-sm' : ''} ${!isFirstOfGroup ? 'rounded-tl-2xl' : ''}`
                } ${m.temp ? 'opacity-70 animate-pulse' : ''}`}
                >
                  {m.replyTo && !m.isDeleted && (
                    <div className={`mb-3 p-2.5 rounded-xl border-l-[3px] bg-black/20 ${isMe ? 'border-white/40' : 'border-[#3b82f6]/60'}`}>
                      <p className="text-[10px] font-black uppercase tracking-wider text-white/40 mb-1">
                        {m.replyTo.senderName}
                      </p>
                      <p className="text-xs text-white/60 truncate italic line-clamp-1">
                        {m.replyTo.text}
                      </p>
                    </div>
                  )}
                  
                  {renderMedia(m)}

                  {m.isDeleted ? (
                    <p className="text-xs italic text-white/30 flex items-center gap-2 py-1">
                      <Trash2 size={12} />
                      This message was deleted
                    </p>
                  ) : (
                    <div className="space-y-2">
                       <p className="whitespace-pre-wrap break-words font-medium">
                        {m.text.split(' ').map((word, i) => {
                          if (word.startsWith('@')) {
                            return <span key={i} className="text-blue-300 font-black cursor-pointer hover:underline">{word} </span>;
                          }
                          return word + ' ';
                        })}
                      </p>
                      {m.edited && (
                        <p className="text-[9px] text-white/30 italic">Edited</p>
                      )}
                    </div>
                  )}

                  {/* Reactions */}
                  {m.reactions && Object.keys(m.reactions).length > 0 && !m.isDeleted && (
                    <div className={`absolute -bottom-2 ${isMe ? 'right-2' : 'left-2'} flex items-center gap-0.5 bg-[#262626] border border-white/10 rounded-full px-1.5 py-0.5 shadow-xl`}>
                      {Object.keys(m.reactions).map(emoji => (
                        <span key={emoji} className="text-[12px]">{emoji}</span>
                      ))}
                      <span className="text-[9px] font-black ml-1 text-white/40">{Object.values(m.reactions).flat().length}</span>
                    </div>
                  )}
                </div>

                {isLastOfGroup && (
                  <div className={`flex items-center gap-1.5 mt-1.5 px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/20">
                      {formatDate(m.createdAt, 'h:mm a')}
                    </span>
                    {isMe && !m.isDeleted && (
                      <span className="opacity-40 scale-75">
                        {m.status === 'seen' ? (
                          <CheckCheck size={14} className="text-[#3b82f6]" />
                        ) : (
                          <Check size={14} className="text-white" />
                        )}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Hover Actions */}
              <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all ${isMe ? 'flex-row-reverse order-first' : 'flex-row'}`}>
                <button 
                  onClick={() => setReplyingTo(m)}
                  className="p-2 hover:bg-white/5 rounded-full text-white/30 hover:text-white"
                >
                  <Reply size={16} />
                </button>
                <button 
                  onClick={(e) => setReactionAnchor({ x: e.clientX, y: e.clientY, messageId: m.id })}
                  className="p-2 hover:bg-white/5 rounded-full text-white/30 hover:text-white"
                >
                  <Smile size={16} />
                </button>
                <button className="p-2 hover:bg-white/5 rounded-full text-white/30 hover:text-white">
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>
          </div>
        </React.Fragment>
      );
    });
  };

  const containerClasses = fullScreen 
    ? "fixed inset-0 z-[200] bg-black flex flex-col md:flex-row overflow-hidden font-sans h-[100dvh]"
    : "relative w-full h-[calc(100vh-120px)] bg-black rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row overflow-hidden font-sans shadow-2xl";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={containerClasses}
    >
      {/* Reaction Floating Tray */}
      <AnimatePresence>
        {reactionAnchor && (
          <>
            <div 
              className="fixed inset-0 z-[300]" 
              onClick={() => setReactionAnchor(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              style={{ 
                left: Math.min(window.innerWidth - 300, Math.max(20, reactionAnchor.x - 150)),
                top: reactionAnchor.y - 80 
              }}
              className="fixed z-[310] flex items-center gap-1 bg-[#2a3942] p-2 rounded-full border border-white/10 shadow-2xl"
            >
              {['👍', '❤️', '😂', '😮', '😢', '🙏'].map(emoji => (
                <button 
                  key={emoji}
                  onClick={() => {
                    handleToggleReaction(reactionAnchor.messageId, emoji);
                    setReactionAnchor(null);
                  }}
                  className="p-2 hover:scale-150 transition-transform text-2xl"
                >
                  {emoji}
                </button>
              ))}
              <div className="w-px h-6 bg-white/10 mx-1" />
              <button 
                onClick={() => {
                  const msg = messages.find(m => m.id === reactionAnchor.messageId);
                  if (msg) setReplyingTo(msg);
                  setReactionAnchor(null);
                }}
                className="p-2 hover:bg-white/5 rounded-full text-[#8696a0] hover:text-[#00a884]"
              >
                <CornerUpLeft size={20} />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Sidebar / List View */}
      <div className={`w-full md:w-[380px] border-r border-white/5 flex flex-col bg-black h-full ${activeConversation ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 space-y-6 shrink-0">
          <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white">Direct</h1>
                        <div className="flex items-center gap-1">
                          <div className="flex bg-white/5 rounded-xl p-1">
                            {['all', 'unread', 'favorites'].map((f) => (
                              <button
                                key={f}
                                onClick={() => setActiveFilter(f as any)}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                  activeFilter === f ? 'bg-[#3b82f6] text-white shadow-lg' : 'text-white/40 hover:text-white'
                                }`}
                              >
                                {f}
                              </button>
                            ))}
                          </div>
                          <button 
                            onClick={() => setShowUserList(true)}
                            className="p-2 hover:bg-white/5 text-white/40 hover:text-white rounded-xl transition-all"
                          >
                            <Plus size={24} />
                          </button>
                        </div>
                      </div>

          <div className="relative">
            <div className="relative bg-white/5 rounded-2xl flex items-center px-4 py-3 border border-white/5 transition-all focus-within:border-[#3b82f6]/50">
              <Search size={18} className="text-white/20" />
              <input 
                type="text"
                placeholder="Search intelligence..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none px-3 text-sm text-white placeholder:text-white/20 outline-none font-bold"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <Loader2 className="animate-spin text-[#3b82f6]" size={32} />
              <p className="text-[10px] font-black uppercase tracking-widest text-white/20 animate-pulse">Syncing Intel...</p>
            </div>
          ) : (
            <div className="px-2 space-y-1">
              {filteredConversations.map((conv) => {
                const unread = conv.unreadCount?.[currentUser.uid] || 0;
                const isAdminConv = conv.id === 'new_admin' || conv.recipientProfile?.role === 'admin' || conv.recipientProfile?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
                const isDevConv = conv.id === 'new_dev' || (profile?.role === 'client' && (conv.recipientProfile?.uid === assignedDeveloper?.uid || conv.recipientProfile?.role === 'developer'));
                const isSupport = isAdminConv || isDevConv;
                
                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConversation(conv)}
                    className={`w-full p-4 flex items-center gap-4 transition-all rounded-[2rem] group ${
                      activeConversation?.id === conv.id ? 'bg-white/10 shadow-lg' : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-xl italic shadow-2xl ${
                        isSupport ? 'bg-[#3b82f6] text-white' : 'bg-white/5 text-white/60 border border-white/10'
                      }`}>
                        {conv.isProject ? <Briefcase size={28} /> : (isAdminConv ? 'WL' : (isDevConv ? 'DEV' : (conv.recipientProfile?.displayName?.[0] || 'U')))}
                      </div>
                      {!conv.isProject && conv.recipientProfile?.status === 'online' && (
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-4 border-black rounded-full" />
                      )}
                    </div>

                    <div className="flex-1 text-left min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <div className="flex items-center gap-2 truncate">
                          <span className="font-black text-white italic uppercase tracking-tighter truncate text-sm">
                            {conv.isProject ? conv.project?.businessName : (isAdminConv ? 'Support' : (isDevConv ? 'Your Developer' : conv.recipientProfile?.displayName))}
                          </span>
                          {profile?.favoriteConversations?.includes(conv.id) && (
                            <Star size={10} className="text-yellow-400 fill-yellow-400 shrink-0" />
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-white/20 uppercase">
                          {conv.lastMessageAt ? formatDate(conv.lastMessageAt, 'h:mm a') : ''}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <p className={`text-xs truncate ${unread > 0 ? 'text-white font-black' : 'text-white/40 font-bold'}`}>
                          {conv.lastSenderId === currentUser.uid && (
                            <span className="text-[#3b82f6] mr-1">You:</span>
                          )}
                          {conv.lastMessage || 'Channel active...'}
                        </p>
                        <div className="flex items-center gap-2">
                           <button 
                            onClick={(e) => toggleFavorite(e, conv.id)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-white/10 rounded-lg text-white/20 hover:text-yellow-400 transition-all"
                           >
                             <Star size={14} className={profile?.favoriteConversations?.includes(conv.id) ? 'fill-yellow-400 text-yellow-400' : ''} />
                           </button>
                           {unread > 0 && (
                            <div className="bg-[#3b82f6] text-white text-[10px] font-black min-w-[20px] h-5 rounded-full flex items-center justify-center px-1.5 shadow-xl shadow-[#3b82f6]/20">
                              {unread}
                            </div>
                           )}
                        </div>
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
      <div className={`flex-1 flex flex-col bg-black relative ${!activeConversation ? 'hidden md:flex' : 'flex'}`}>
        {activeConversation ? (
          <div key={activeConversation.id} className="flex-1 flex flex-col overflow-hidden relative z-10">
            {/* Header */}
            <header className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-black relative z-20">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setActiveConversation(null)}
                  className="p-2 hover:bg-white/5 rounded-xl text-white/40 md:hidden"
                >
                  <ArrowLeft size={24} />
                </button>
                <div className="relative">
                   {(() => {
                     const isAdminConv = activeConversation.id === 'new_admin' || activeConversation.recipientProfile?.role === 'admin' || activeConversation.recipientProfile?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
                     const isDevConv = activeConversation.id === 'new_dev' || (profile?.role === 'client' && activeConversation.recipientProfile?.uid === assignedDeveloper?.uid);
                     const isSupport = isAdminConv || isDevConv;

                     return (
                       <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-black text-lg italic shadow-2xl ${
                         activeConversation.isProject || isSupport ? 'bg-[#3b82f6] text-white' : 'bg-white/5 border border-white/10 text-white'
                       }`}>
                         {activeConversation.isProject ? <Briefcase size={22} /> : (isAdminConv ? 'WL' : (isDevConv ? 'DEV' : (activeConversation.recipientProfile?.displayName?.[0] || 'U')))}
                       </div>
                     );
                   })()}
                </div>
                <div>
                  <h3 className="font-black text-white text-lg italic uppercase tracking-tighter leading-tight">
                    {(() => {
                      const isAdminConv = activeConversation.id === 'new_admin' || activeConversation.recipientProfile?.role === 'admin' || activeConversation.recipientProfile?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
                      const isDevConv = activeConversation.id === 'new_dev' || (profile?.role === 'client' && (activeConversation.recipientProfile?.uid === assignedDeveloper?.uid || activeConversation.recipientProfile?.role === 'developer'));
                      
                      return activeConversation.isProject ? activeConversation.project?.businessName : (isAdminConv ? 'Support' : (isDevConv ? 'Your Developer' : activeConversation.recipientProfile?.displayName));
                    })()}
                  </h3>
                  <div className="flex items-center gap-2">
                    {typingUsers.length > 0 ? (
                      <p className="text-[10px] text-[#3b82f6] font-black uppercase tracking-widest animate-pulse">Analyzing Typing Data...</p>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${activeConversation.recipientProfile?.status === 'online' ? 'bg-green-500' : 'bg-white/20'}`} />
                        <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">
                          {activeConversation.recipientProfile?.status === 'online' ? 'Active Intel' : 'Station Offline'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                 <button className="p-3 hover:bg-white/5 rounded-2xl text-white/20 hover:text-white transition-all">
                    <Video size={22} />
                 </button>
                 <button className="p-3 hover:bg-white/5 rounded-2xl text-white/20 hover:text-white transition-all">
                    <MoreVertical size={22} />
                 </button>
              </div>
            </header>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 md:px-10 py-10 space-y-2 relative z-10 custom-scrollbar scroll-smooth bg-black"
            >
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full space-y-6 opacity-20">
                  <MessageSquare size={64} className="text-white mb-4" />
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-white">Encryption Establised</p>
                </div>
              ) : (
                renderMessages()
              )}
            </div>
            
            {renderReactionPopup()}

            {/* Input Area */}
            <footer className="p-4 md:p-6 bg-black relative z-20">
               <div className="max-w-4xl mx-auto space-y-4">
                 {replyingTo && (
                   <div className="flex items-center justify-between px-6 py-3 bg-white/5 rounded-2xl border-l-[4px] border-[#3b82f6]">
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-[#3b82f6] uppercase tracking-widest">Replying to {replyingTo.senderName}</p>
                        <p className="text-xs text-white/40 truncate italic">{replyingTo.text}</p>
                      </div>
                      <button onClick={() => setReplyingTo(null)} className="p-2 hover:bg-white/10 rounded-full text-white/40">
                        <X size={18} />
                      </button>
                   </div>
                 )}

                 <div className="flex items-center gap-3 bg-[#1A1A1A] rounded-[2rem] p-2 pr-4 border border-white/5 focus-within:border-[#3b82f6]/30 transition-all shadow-2xl">
                    <div className="flex items-center">
                       <input 
                         type="file" 
                         id="file-upload" 
                         className="hidden" 
                         multiple 
                         onChange={(e) => handleFileUpload(e.target.files)} 
                       />
                       <label htmlFor="file-upload" className="p-4 text-white/20 hover:text-[#3b82f6] transition-all cursor-pointer">
                         <Plus size={24} />
                       </label>
                    </div>

                    <input 
                       type="text"
                       value={inputText}
                       onChange={handleInputChange}
                       onKeyPress={(e) => {
                         if (e.key === 'Enter' && !e.shiftKey) {
                           e.preventDefault();
                           handleSendMessage(e as any);
                         }
                       }}
                       placeholder="Send intel..."
                       className="flex-1 bg-transparent border-none py-4 text-sm text-white placeholder:text-white/20 outline-none font-bold italic"
                    />

                    <div className="flex items-center gap-1">
                      <button className="p-3 text-white/20 hover:text-[#3b82f6] transition-all">
                        <Smile size={24} />
                      </button>
                      
                      {inputText.trim() ? (
                        <button 
                          onClick={handleSendMessage}
                          disabled={isSending}
                          className="bg-[#3b82f6] text-white p-4 rounded-full shadow-xl shadow-[#3b82f6]/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
                        >
                          <Send size={20} />
                        </button>
                      ) : (
                        <button 
                          onClick={startRecording}
                          disabled={isSending}
                          className="p-4 text-white/20 hover:text-[#3b82f6] transition-all"
                        >
                          <Mic size={24} />
                        </button>
                      )}
                    </div>
                 </div>
               </div>
            </footer>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-10 bg-black">
             <div className="w-32 h-32 bg-white/[0.02] rounded-full flex items-center justify-center relative">
                <div className="absolute inset-0 bg-[#3b82f6]/5 rounded-full blur-2xl animate-pulse" />
                <MessageCircle size={64} className="text-[#3b82f6] relative z-10" />
             </div>
             <div className="space-y-4 max-w-sm">
               <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Select a Channel</h2>
               <p className="text-sm font-black uppercase text-white/20 tracking-widest leading-relaxed">
                 Encrypted direct communication center. Contact Webby Launch support or your project team.
               </p>
             </div>
          </div>
        )}
      </div>


      <AnimatePresence>
        {pendingFiles.length > 0 && (
          <FilePreviewEditor 
            files={pendingFiles}
            onCancel={() => setPendingFiles([])}
            onSend={handleSendFromEditor}
            onAddMore={() => {
              const input = document.getElementById('file-upload') as HTMLInputElement;
              input?.click();
            }}
          />
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
