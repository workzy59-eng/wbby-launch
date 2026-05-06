import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { getNotifications, markNotificationAsRead } from '../services/database';
import { Notification } from '../types';
import { Bell, MessageSquare, Video, CheckCircle } from 'lucide-react';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lastNotificationId, setLastNotificationId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) return;

    const role = profile?.role || 'client';
    const unsub = getNotifications(user.uid, (newNotifications) => {
      // Find new unread notifications that we haven't toasted yet
      const unread = newNotifications.filter(n => !n.read);
      
      if (unread.length > 0) {
        const latest = unread[0];
        if (latest.id !== lastNotificationId) {
          setLastNotificationId(latest.id);
          
          // Show Toast
          toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-[#111] border border-[#c7c42a]/30 shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 p-4`}>
              <div className="flex-1 w-0 p-1">
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    <div className="w-10 h-10 bg-[#c7c42a]/10 rounded-full flex items-center justify-center text-[#c7c42a]">
                      {latest.type === 'progress' && <CheckCircle size={20} />}
                      {latest.type === 'system' && <Bell size={20} />}
                      {latest.type === 'admin' && <Bell size={20} />}
                      {(latest as any).type === 'new_message' && <MessageSquare size={20} />}
                      {(latest as any).type === 'meeting' && <Video size={20} />}
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-xs font-black uppercase tracking-widest text-[#c7c42a]">
                      {latest.title}
                    </p>
                    <p className="mt-1 text-sm text-white/60 font-medium">
                      {latest.description}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-white/5">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-xs font-bold text-white/40 hover:text-white transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ), { duration: 5000, position: 'top-right' });
        }
      }
      
      setNotifications(newNotifications);
    }, role);

    return () => unsub();
  }, [user, lastNotificationId]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
