import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  MessageSquare, 
  User, 
  Layout, 
  Calendar,
  Grid,
  Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getUnreadMessageCount } from '../services/database';

interface BottomNavProps {
  userId: string;
  role: string;
  onOpenMessages?: () => void;
}

export default function BottomNav({ userId, role, onOpenMessages }: BottomNavProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;
    const unsub = getUnreadMessageCount(userId, setUnreadCount);
    return () => unsub?.();
  }, [userId]);

  const navItems = [
    { icon: Home, label: 'Home', path: role === 'admin' ? '/admin' : '/dashboard' },
    { icon: Grid, label: 'Projects', path: role === 'admin' ? '/admin/projects' : '/dashboard' },
    { icon: MessageSquare, label: 'Chat', onClick: onOpenMessages, badge: unreadCount },
    { icon: role === 'developer' ? Calendar : User, label: role === 'developer' ? 'Schedule' : 'Profile', path: '/settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-[64px] bg-black border-t border-white/10 z-[100] md:hidden px-4">
      <div className="h-full max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item, idx) => (
          item.onClick ? (
            <button
              key={idx}
              onClick={item.onClick}
              className="relative flex flex-col items-center justify-center p-2 text-white/50 hover:text-[#FFFF00] transition-colors"
            >
              <item.icon size={20} />
              <span className="text-[8px] font-black uppercase tracking-widest mt-1">{item.label}</span>
              <AnimatePresence>
                {item.badge > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-[#FFFF00] text-black text-[8px] font-black rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(255,255,0,0.5)]"
                  >
                    {item.badge}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          ) : (
            <NavLink
              key={idx}
              to={item.path!}
              className={({ isActive }) => 
                `flex flex-col items-center justify-center p-2 transition-colors ${
                  isActive ? 'text-[#FFFF00]' : 'text-white/50'
                }`
              }
            >
              <item.icon size={20} />
              <span className="text-[8px] font-black uppercase tracking-widest mt-1">{item.label}</span>
            </NavLink>
          )
        ))}
      </div>
    </nav>
  );
}
