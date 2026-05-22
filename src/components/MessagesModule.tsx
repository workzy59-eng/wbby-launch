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
  Star,
  Settings2,
  Mic,
  Play
} from 'lucide-react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import EmojiPicker, { Theme as EmojiTheme } from 'emoji-picker-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
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

  const downloadFileUrl = (url: string, filename: string) => {
    if (!url) return;
    
    let downloadUrl = url;
    if (url.includes('cloudinary.com') && !url.includes('fl_attachment')) {
      const parts = url.split('/upload/');
      if (parts.length === 2) {
        downloadUrl = `${parts[0]}/upload/fl_attachment/${parts[1]}`;
      }
    }

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
        const res = await uploadFile(imageToUpload, 'chat-files');
        mediaUrl = res.url;
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
          fileType: imageToUpload ? imageToUpload.type : 'text',
          fileName: imageToUpload ? imageToUpload.name : null,
          mediaUrl: mediaUrl,
          fileUrl: mediaUrl, // Add as alias for compatibility
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
    setShowEmojiPicker(false);
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
          const res = await uploadFile(audioFile, 'chat-files');
          const voiceUrl = res.url;
          
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
    
    // Check if message text is a URL (fallback for when type isn't set correctly)
    const imageRegex = /\.(jpeg|jpg|gif|png|webp|svg)$/i;
    const fileRegex = /\.(pdf|zip|rar|doc|docx|xls|xlsx|ppt|pptx|txt|json|csv)$/i;
    const isUrlImage = m.text && (imageRegex.test(m.text) || m.text.includes('cloudinary.com') || m.text.includes('firebasestorage.googleapis.com'));
    const isUrlFile = m.text && fileRegex.test(m.text);

    const effectiveUrl = mediaUrl || (isUrlImage || isUrlFile ? m.text : null);

    if (!effectiveUrl) return null;

    const isImage = m.type === 'image' || isUrlImage || (m.fileType && m.fileType.startsWith('image/'));

    if (isImage) {
      return (
        <div 
          className="relative group/media mb-2 rounded-xl overflow-hidden border border-white/10 cursor-pointer bg-[#2a3942]" 
          onClick={() => setSelectedImage(effectiveUrl)}
        >
          <img src={effectiveUrl} alt="Shared" className="max-w-full h-auto max-h-[300px] object-cover" />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/media:opacity-100 transition-all flex items-center justify-center">
            <Maximize2 size={24} className="text-white drop-shadow-lg" />
          </div>
          <div className="absolute top-2 right-2 opacity-0 group-hover/media:opacity-100 transition-all flex gap-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                downloadFileUrl(effectiveUrl, m.fileName || 'image.jpg');
              }}
              className="p-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-black transition-all"
            >
              <Download size={14} />
            </button>
          </div>
          <p className="absolute bottom-2 left-2 text-[8px] font-black uppercase text-[#FFFF00] bg-black/60 px-2 py-0.5 rounded-full tracking-widest backdrop-blur-sm opacity-0 group-hover/media:opacity-100 transition-opacity">Visual Intel Attached</p>
        </div>
      );
    }

    if (m.type === 'file' || isUrlFile || (m.fileType && !m.fileType.startsWith('image/') && m.type !== 'voice')) {
      const fileName = m.fileName || (m.text && !m.text.includes('http') ? m.text : (effectiveUrl.split('/').pop()?.split('?')[0])) || 'Intel Document';
      const isProjectFile = fileName.toLowerCase().match(/\.(zip|pdf|rar)$/);

      return (
        <div className={`p-4 rounded-2xl border-2 mb-2 transition-all group/file bg-black shadow-2xl ${
          isProjectFile ? 'border-cyan-500/50' : 'border-white/10 hover:border-white/20'
        }`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isProjectFile ? 'bg-cyan-500 text-black' : 'bg-white/10 text-white'}`}>
              <FileText size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-white truncate tracking-tight uppercase italic">{fileName}</p>
              <p className="text-[9px] text-white/40 font-black uppercase tracking-widest mt-0.5">
                {isProjectFile ? 'Critical Project Resource' : 'Data Document'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => downloadFileUrl(effectiveUrl, fileName)}
              className="flex-1 py-2.5 bg-yellow-400 hover:bg-white text-black rounded-xl font-black uppercase italic text-[10px] tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-yellow-400/20"
            >
              <Download size={12} />
              Retrieve
            </button>
            <button 
              onClick={() => window.open(effectiveUrl, '_blank')}
              className="px-3 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-xl transition-all"
            >
              <ExternalLink size={12} />
            </button>
          </div>
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
          const res = await uploadFile(file, 'chat-files');
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));

          const senderName = getEffectiveSenderName();

          const messageData = {
            senderId: currentUser.uid,
            senderName: senderName,
            text: `Shared ${file.name}`,
            type: 'file',
            fileType: file.type,
            mediaUrl: res.url,
            fileUrl: res.url,
            fileName: file.name,
            cloudinaryMetadata: {
              public_id: res.public_id,
              secure_url: res.secure_url,
              original_filename: res.original_filename
            },
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
          const res = await uploadFile(file, 'chat-files');
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));

          const messageData = {
            senderId: currentUser.uid,
            senderName: getEffectiveSenderName(),
            text: item.caption || 'Sent a photo',
            type: 'image',
            fileType: file.type,
            mediaUrl: res.url,
            fileUrl: res.url,
            fileName: file.name,
            cloudinaryMetadata: {
              public_id: res.public_id,
              secure_url: res.secure_url,
              original_filename: res.original_filename
            },
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
        const mainAdmin = admins.find(a => a.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) || admins[0];
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
      
      const isFirstOfGroup = idx === 0 || messages[idx-1].senderId !== m.senderId;
      const isLastOfGroup = idx === messages.length - 1 || messages[idx+1].senderId !== m.senderId;
      
      return (
        <motion.div 
          key={m.id}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className={`flex flex-col mb-1 ${isMe ? 'items-end' : 'items-start'}`}
        >
          {showDate && (
            <div className="w-full flex justify-center my-10">
              <span className="text-[10px] font-black tracking-[0.3em] text-white/10 uppercase italic">
                {messageDate}
              </span>
            </div>
          )}

          <div className={`flex items-end gap-2 max-w-[85%] md:max-w-[70%] group/item`}>
            {!isMe && (
              <div className="w-8 h-8 mb-1 shrink-0">
                {isLastOfGroup ? (
                   <div className="w-full h-full rounded-xl bg-white/5 border border-white/5 flex items-center justify-center overflow-hidden">
                      {activeConversation?.recipientProfile?.photoURL ? (
                        <img src={activeConversation.recipientProfile.photoURL} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] font-black italic text-[#c7c42a]">
                          {activeConversation?.recipientProfile?.displayName?.[0] || 'U'}
                        </span>
                      )}
                   </div>
                ) : <div className="w-8" />}
              </div>
            )}

            <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} relative`}>
               <div 
                  className={`relative p-4 md:px-6 md:py-4 transition-all duration-300 ${
                  isMe 
                    ? 'bg-[#c7c42a] text-black shadow-[0_10px_30px_rgba(199,196,42,0.15)]' 
                    : 'bg-white/5 text-white border border-white/5'
                } ${
                  isMe 
                    ? `rounded-[28px] ${isLastOfGroup ? 'rounded-br-sm' : ''} ${!isFirstOfGroup ? 'rounded-tr-2xl' : ''}` 
                    : `rounded-[28px] ${isLastOfGroup ? 'rounded-bl-sm' : ''} ${!isFirstOfGroup ? 'rounded-tl-2xl' : ''}`
                }`}
                >
                  {m.replyTo && !m.isDeleted && (
                    <div className={`mb-3 p-3 rounded-2xl bg-black/10 border-l-4 border-black/20 text-xs italic opacity-60`}>
                       <span className="font-black uppercase block mb-1 text-[9px]">Transmission Reply</span>
                       {m.replyTo.text}
                    </div>
                  )}

                  {renderMedia(m)}

                  {m.isDeleted ? (
                    <p className="text-xs italic opacity-30 flex items-center gap-2">
                       <Trash2 size={12} /> Deleted Transmission
                    </p>
                  ) : (
                    <div className="space-y-1">
                       {m.text && m.text !== 'Sent a photo' && m.text !== 'Sent a file' && (
                         <p className="text-[14px] font-medium leading-relaxed tracking-tight whitespace-pre-wrap">
                            {m.text}
                         </p>
                       )}
                       {m.edited && (
                         <span className="text-[8px] font-black uppercase tracking-widest opacity-30">Modified</span>
                       )}
                    </div>
                  )}

                  {/* Reaction Overlay */}
                  {m.reactions && Object.keys(m.reactions).length > 0 && (
                    <div className={`absolute -bottom-3 ${isMe ? 'right-4' : 'left-4'} flex bg-[#111] border border-white/5 rounded-full px-2 py-1 shadow-2xl scale-90`}>
                       {Object.keys(m.reactions).map(emoji => (
                         <span key={emoji} className="text-sm">{emoji}</span>
                       ))}
                    </div>
                  )}
               </div>

               {isLastOfGroup && (
                 <div className={`flex items-center gap-2 mt-2 px-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/20 italic">
                      {formatDate(m.createdAt, 'time')}
                    </span>
                    {isMe && (
                      <div className="scale-75">
                         {m.status === 'seen' ? (
                           <CheckCheck size={14} className="text-[#c7c42a] shadow-lg" />
                         ) : (
                           <Check size={14} className="text-white/20" />
                         )}
                      </div>
                    )}
                 </div>
               )}
            </div>

            {/* Hidden Actions (Hover) */}
            <div className={`flex gap-1 items-center opacity-0 group-hover/item:opacity-100 transition-all duration-300 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
               <button onClick={() => setReplyingTo(m)} className="p-2 text-white/10 hover:text-white transition-colors">
                 <Reply size={14} />
               </button>
               <button onClick={(e) => setReactionAnchor({ x: e.clientX, y: e.clientY, messageId: m.id })} className="p-2 text-white/10 hover:text-[#c7c42a] transition-colors">
                 <Smile size={14} />
               </button>
            </div>
          </div>
        </motion.div>
      );
    });
  };

  const containerClasses = fullScreen 
    ? "fixed inset-0 z-[200] bg-black flex flex-col md:flex-row overflow-hidden font-sans h-[100dvh]"
    : "relative w-full h-[calc(100vh-120px)] bg-black rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row overflow-hidden font-sans shadow-2xl";

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-black/90 backdrop-blur-xl transition-all duration-500`}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={`w-full overflow-hidden bg-[#0a0a0a] border border-white/5 relative flex flex-col md:flex-row transition-all duration-500 ${
          fullScreen ? 'h-full md:h-[92vh] md:max-w-[1200px] md:rounded-[2.5rem]' : 'h-full'
        }`}
      >
        {/* --- Sidebar (Conversations List) --- */}
        <aside className={`w-full md:w-[380px] border-r border-white/5 flex flex-col bg-[#050505] relative z-20 ${
          activeConversation && 'hidden md:flex'
        }`}>
          {/* Sidebar Header */}
          <div className="p-6 pb-2">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Direct</h2>
                <div className="w-2 h-2 rounded-full bg-[#c7c42a] animate-pulse" />
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowUserList(true)}
                  className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full transition-all text-white/60 hover:text-white"
                >
                  <Plus size={20} />
                </button>
                <button 
                  onClick={onClose}
                  className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full transition-all text-white/60 md:hidden"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6">
              {[
                { id: 'all', label: 'All' },
                { id: 'unread', label: 'Unread' },
                { id: 'favorites', label: 'Favorites' }
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id as any)}
                  className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeFilter === filter.id 
                      ? 'bg-[#c7c42a] text-black shadow-lg shadow-[#c7c42a]/20' 
                      : 'bg-white/5 text-white/40 hover:bg-white/10'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative group mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#c7c42a] transition-colors" size={16} />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Intelligence..."
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white outline-none focus:bg-white/10 focus:border-[#c7c42a]/50 transition-all placeholder:text-white/10"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto px-4 space-y-1 custom-scrollbar pb-10">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 opacity-20">
                <Loader color="yellow" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center opacity-20">
                <MessageSquare size={48} className="mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest">No Transmissions Found</p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isActive = activeConversation?.id === conv.id;
                const unread = conv.unreadCount?.[currentUser.uid] || 0;
                const isFavorite = profile?.favoriteConversations?.includes(conv.id);
                
                return (
                  <motion.div
                    key={conv.id}
                    layoutId={`conv-${conv.id}`}
                    onClick={() => setActiveConversation(conv)}
                    className={`group p-4 rounded-3xl cursor-pointer transition-all flex items-center gap-4 relative overflow-hidden ${
                      isActive 
                        ? 'bg-[#c7c42a] text-black' 
                        : 'hover:bg-white/5 text-white'
                    }`}
                  >
                    {/* Active Background Glow */}
                    {isActive && (
                      <motion.div 
                        layoutId="active-glow"
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent blur-xl" 
                      />
                    )}

                    <div className="relative shrink-0">
                      <div className={`w-14 h-14 rounded-2xl overflow-hidden shadow-2xl relative z-10 ${
                        isActive ? 'bg-black/10' : 'bg-white/10'
                      }`}>
                        {conv.isProject ? (
                          <div className="w-full h-full flex items-center justify-center text-[#c7c42a]">
                            <Briefcase size={24} />
                          </div>
                        ) : conv.recipientProfile?.photoURL ? (
                          <img src={conv.recipientProfile.photoURL} alt="User" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl font-black italic text-[#c7c42a]">
                            {(conv.recipientProfile?.displayName || conv.id)[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      
                      {/* Online Indicator */}
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 ${
                        isActive ? 'border-[#c7c42a]' : 'border-[#050505]'
                      } ${conv.recipientProfile?.status === 'online' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-white/20'}`} />
                    </div>

                    <div className="flex-1 min-w-0 relative z-10">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className={`text-sm font-black italic uppercase tracking-tighter truncate ${
                          isActive ? 'text-black' : 'text-white'
                        }`}>
                          {conv.isProject ? conv.project?.businessName : conv.recipientProfile?.displayName}
                        </h4>
                        <span className={`text-[9px] font-black uppercase italic ${
                          isActive ? 'text-black/40' : 'text-white/20'
                        }`}>
                          {conv.lastMessageAt ? formatDate(conv.lastMessageAt, 'time') : ''}
                        </span>
                      </div>
                      <p className={`text-xs truncate ${
                        isActive ? 'text-black/60 font-bold' : unread > 0 ? 'text-white font-black' : 'text-white/40'
                      }`}>
                        {conv.lastSenderId === currentUser.uid && 'You: '}{conv.lastMessage || 'Channel active...'}
                      </p>
                    </div>

                    {unread > 0 && (
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black ${
                        isActive ? 'bg-black text-[#c7c42a]' : 'bg-[#c7c42a] text-black'
                      } shadow-lg relative z-10`}>
                        {unread}
                      </div>
                    )}

                    {!isActive && isFavorite && (
                      <Star size={10} className="text-[#c7c42a] fill-[#c7c42a] absolute top-4 right-4" />
                    )}
                  </motion.div>
                );
              })
            )}
          </div>

          {/* User Profile Footer */}
          <div className="p-6 bg-black/40 backdrop-blur-xl border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#c7c42a] flex items-center justify-center text-black font-black italic overflow-hidden">
                {profile?.photoURL ? (
                  <img src={profile.photoURL} alt="P" className="w-full h-full object-cover" />
                ) : (
                  profile?.displayName?.[0] || 'U'
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#c7c42a] truncate">{profile?.displayName}</p>
                <p className="text-[8px] font-bold text-white/40 uppercase tracking-tighter truncate">Operational & Secure</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-white/20 hover:text-white transition-all hidden md:block">
              <Settings2 size={18} />
            </button>
          </div>
        </aside>

        {/* --- Main Chat Area --- */}
        <main className={`flex-1 flex flex-col min-w-0 bg-[#0a0a0a] relative ${
          !activeConversation && 'hidden md:flex'
        }`}>
          {activeConversation ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Chat Header */}
              <header className="p-6 bg-[#0a0a0a]/80 backdrop-blur-2xl border-b border-white/5 flex items-center justify-between sticky top-0 z-30">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setActiveConversation(null)}
                    className="p-2 text-white/40 hover:text-white transition-all md:hidden"
                  >
                    <ArrowLeft size={24} />
                  </button>
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center overflow-hidden border border-white/5 shadow-2xl shadow-black">
                      {activeConversation.isProject ? (
                        <div className="text-[#c7c42a]"><Briefcase size={20} /></div>
                      ) : activeConversation.recipientProfile?.photoURL ? (
                        <img src={activeConversation.recipientProfile.photoURL} alt="User" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-lg font-black italic text-[#c7c42a]">
                          {(activeConversation.recipientProfile?.displayName || activeConversation.id)[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    {!activeConversation.isProject && (
                      <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-[3px] border-[#0a0a0a] ${
                        activeConversation.recipientProfile?.status === 'online' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-white/20'
                      }`} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-black italic uppercase tracking-tighter text-white truncate leading-none mb-1">
                      {activeConversation.isProject ? activeConversation.project?.businessName : activeConversation.recipientProfile?.displayName}
                    </h3>
                    <div className="flex items-center gap-2">
                       <p className={`text-[10px] font-black uppercase tracking-widest ${
                         activeConversation.recipientProfile?.status === 'online' ? 'text-green-500' : 'text-white/20'
                       }`}>
                         {activeConversation.isProject ? 'Project Channel Active' : activeConversation.recipientProfile?.status === 'online' ? 'Active Intel' : 'Station Offline'}
                       </p>
                       {typingUsers.length > 0 && (
                         <>
                           <span className="w-1 h-1 rounded-full bg-white/20" />
                           <div className="flex gap-0.5 items-center">
                              <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-1 h-1 bg-[#c7c42a] rounded-full" />
                              <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-1 h-1 bg-[#c7c42a] rounded-full" />
                              <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-1 h-1 bg-[#c7c42a] rounded-full" />
                              <span className="text-[8px] font-black uppercase tracking-widest text-[#c7c42a] ml-1">Transmitting...</span>
                           </div>
                         </>
                       )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                   <button 
                     onClick={() => setShowSearch(!showSearch)}
                     className={`p-3 rounded-2xl transition-all ${showSearch ? 'bg-[#c7c42a] text-black shadow-lg shadow-[#c7c42a]/20' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                   >
                     <Search size={20} />
                   </button>
                   <button 
                     onClick={(e) => activeConversation && toggleFavorite(e, activeConversation.id)}
                     className={`p-3 rounded-2xl transition-all ${
                       activeConversation && profile?.favoriteConversations?.includes(activeConversation.id)
                         ? 'bg-[#c7c42a] text-black shadow-lg shadow-[#c7c42a]/20' 
                         : 'bg-white/5 text-white/40 hover:bg-white/10'
                     }`}
                   >
                     <Star size={20} fill={activeConversation && profile?.favoriteConversations?.includes(activeConversation.id) ? 'currentColor' : 'none'} />
                   </button>
                </div>

                <AnimatePresence>
                  {showSearch && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="absolute top-full left-0 w-full p-4 bg-[#0a0a0a]/90 backdrop-blur-2xl border-b border-white/5 z-20"
                    >
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                        <input 
                          type="text"
                          value={messageSearchQuery}
                          onChange={(e) => setMessageSearchQuery(e.target.value)}
                          placeholder="Search transmission history..."
                          className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm font-bold text-white outline-none focus:bg-white/10 focus:border-[#c7c42a]/50 transition-all"
                          autoFocus
                        />
                         <button 
                           onClick={() => { setShowSearch(false); setMessageSearchQuery(''); }}
                           className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white"
                         >
                           <X size={16} />
                         </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </header>

              {/* Messages Container */}
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-6 md:px-12 py-12 space-y-4 custom-scrollbar bg-chat-pattern scroll-smooth"
              >
                {renderMessages()}
              </div>

              {/* Input Area */}
              <footer className="p-8 bg-[#0a0a0a]/80 backdrop-blur-2xl border-t border-white/5 relative z-40">
                {/* Replying State Indicator */}
                <AnimatePresence>
                  {(replyingTo || editingMessage) && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="absolute bottom-full left-0 w-full p-4 px-12 bg-[#111] border-t border-white/5 flex items-center justify-between gap-4 z-10 shadow-2xl"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2.5 bg-[#c7c42a]/10 rounded-xl text-[#c7c42a]">
                          {editingMessage ? <Edit size={16} /> : <Reply size={16} />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9px] font-black uppercase tracking-widest text-[#c7c42a]">
                            {editingMessage ? 'Modifying Transmission' : `Replying to ${replyingTo?.senderName}`}
                          </p>
                          <p className="text-xs text-white/40 truncate italic">{editingMessage ? editingMessage.text : replyingTo?.text}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => { setReplyingTo(null); setEditingMessage(null); }}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-white/40 hover:text-white"
                      >
                        <X size={16} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="max-w-5xl mx-auto flex items-end gap-5">
                   <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="w-14 h-14 bg-white/5 hover:bg-white/10 rounded-[22px] flex items-center justify-center text-white/40 hover:text-white transition-all shadow-xl group">
                          <Paperclip size={20} className="group-hover:rotate-45 transition-transform" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-56 bg-[#1a1a1a] border-white/5 rounded-3xl p-2 shadow-2xl backdrop-blur-3xl mb-4" align="start">
                        <button 
                          onClick={() => document.getElementById('image-upload')?.click()}
                          className="w-full flex items-center gap-3 p-4 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/5 rounded-2xl transition-all"
                        >
                          <ImageIcon size={16} className="text-[#c7c42a]" /> Visual Intel
                        </button>
                        <button 
                          onClick={() => document.getElementById('file-upload')?.click()}
                          className="w-full flex items-center gap-3 p-4 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/5 rounded-2xl transition-all"
                        >
                          <FileText size={16} className="text-[#c7c42a]" /> Data Document
                        </button>
                      </PopoverContent>
                    </Popover>
                    <input id="image-upload" type="file" hidden accept="image/*" multiple onChange={(e) => handleFileUpload(e.target.files)} />
                    <input id="file-upload" type="file" hidden onChange={(e) => handleFileUpload(e.target.files)} />
                  </div>

                  <form 
                    onSubmit={handleSendMessage}
                    className="flex-1 flex items-center bg-white/5 rounded-[30px] p-1.5 pl-6 transition-all focus-within:bg-white/10 focus-within:ring-2 focus-within:ring-[#c7c42a]/20 group border border-white/5 relative"
                  >
                    <input 
                      type="text"
                      value={inputText}
                      onChange={handleInputChange}
                      placeholder="Transmitting Intel..."
                      className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-white py-4 placeholder:text-white/10"
                    />
                    
                    <div className="flex items-center gap-1 pr-2">
                       <button 
                         type="button"
                         onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                         className={`p-3 rounded-2xl transition-all ${showEmojiPicker ? 'text-[#c7c42a]' : 'text-white/20 hover:text-white'}`}
                       >
                         <Smile size={22} />
                       </button>

                       {showEmojiPicker && (
                         <div className="absolute bottom-full right-0 mb-6 z-50">
                           <EmojiPicker 
                             onEmojiClick={onEmojiClick}
                             theme={EmojiTheme.DARK}
                             width={350}
                             height={450}
                           />
                         </div>
                       )}

                       <div className="h-8 w-[1px] bg-white/5 mx-2" />
                       
                       <button 
                          onClick={handleSendMessage}
                          disabled={isSending || (!inputText.trim() && !previewImage)}
                          className={`p-4 rounded-full transition-all flex items-center justify-center ${
                            inputText.trim() || previewImage 
                            ? 'bg-[#c7c42a] text-black shadow-xl shadow-[#c7c42a]/20 hover:scale-105 active:scale-95' 
                            : 'bg-white/5 text-white/20 cursor-not-allowed'
                          }`}
                        >
                          {isSending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                        </button>
                    </div>
                  </form>
                </div>
              </footer>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-chat-pattern relative overflow-hidden">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9, y: 20 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 className="relative z-10 flex flex-col items-center text-center p-12"
               >
                 <div className="w-24 h-24 bg-[#c7c42a]/10 rounded-full flex items-center justify-center mb-8">
                    <MessageSquare size={48} className="text-[#c7c42a]" />
                 </div>
                 <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-4">Direct <span className="text-[#c7c42a]">Channel.</span></h2>
                 <p className="text-sm font-black uppercase tracking-[0.2em] text-white/20 mb-10 max-w-sm">
                   Establish a secure transmission link to communicate with the network.
                 </p>
                 <button 
                   onClick={() => setShowUserList(true)}
                   className="px-10 py-5 bg-[#c7c42a] text-black rounded-[2rem] font-black uppercase italic tracking-tighter text-lg hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-[#c7c42a]/20 flex items-center gap-3"
                 >
                   New Transmission
                   <Plus size={20} />
                 </button>
               </motion.div>
            </div>
          )}
        </main>

        {/* --- Floating Intelligence List (New Chat) --- */}
        <AnimatePresence>
          {showUserList && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-[#050505]/95 backdrop-blur-3xl flex items-center justify-center p-4"
            >
              <div className="w-full max-w-[500px] bg-[#111] border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl relative">
                <header className="p-8 border-b border-white/5 flex items-center justify-between">
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white leading-none">New Intel Link</h3>
                  <button 
                    onClick={() => { setShowUserList(false); setSearchQuery(''); }}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-white/40 hover:text-white"
                  >
                    <X size={20} />
                  </button>
                </header>

                <div className="p-8 space-y-6">
                   <div className="relative group">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#c7c42a]" size={16} />
                     <input 
                       type="text"
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                       placeholder="Scan for Personnel..."
                       className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white outline-none focus:bg-white/10 focus:border-[#c7c42a]/50 transition-all"
                       autoFocus
                     />
                   </div>

                   <div className="max-h-[400px] overflow-y-auto custom-scrollbar space-y-2 pr-2">
                     {allProfiles
                       .filter(p => !searchQuery || p.displayName?.toLowerCase().includes(searchQuery.toLowerCase()))
                       .map(user => (
                         <button
                           key={user.uid}
                           onClick={() => startNewChat(user)}
                           className="w-full flex items-center gap-4 p-4 hover:bg-white/5 rounded-[2rem] transition-all text-left border border-transparent hover:border-white/5 group"
                         >
                            <div className="relative">
                              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white/20 overflow-hidden border border-white/5 group-hover:border-[#c7c42a]/30 transition-all">
                                {user.photoURL ? <img src={user.photoURL} className="w-full h-full object-cover" /> : (user.displayName?.[0] || 'U')}
                              </div>
                              {user.status === 'online' && (
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-4 border-[#111]" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-black italic uppercase tracking-tighter text-white truncate mb-0.5">{user.displayName}</p>
                              <p className="text-[9px] font-black uppercase tracking-widest text-[#c7c42a]/40">{user.role || 'Personnel'}</p>
                            </div>
                            <ArrowRight size={18} className="ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-[#c7c42a]" />
                         </button>
                       ))}
                   </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- Image Preview Modal --- */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
              className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4 md:p-12"
            >
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute top-10 right-10 p-5 bg-white/5 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-all z-10"
              >
                <X size={28} />
              </button>
              <motion.img 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                src={selectedImage} 
                alt="Fullscreen" 
                className="max-w-full max-h-full object-contain rounded-3xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- File Editor (Images) --- */}
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

        {/* --- Reaction Popup Overlay --- */}
        {renderReactionPopup()}
      </motion.div>
    </div>
  );
}
