import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Bell, ShieldAlert, Check, CheckCircle2, Video, MessageSquare, ListFilter, Trash2 } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { requestNotificationPermission } from '../services/onesignal';
import { toast } from 'react-hot-toast';

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [permissionState, setPermissionState] = useState<string>('default');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionState(Notification.permission);
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionState(Notification.permission);
    }
    if (granted) {
      toast.success("Push subscription active!");
    }
  };

  const activeNotifs = notifications.slice(0, 5);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Bell Trigger Icon */}
      <button
        onClick={handleToggle}
        className="relative p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/15 focus:outline-none transition-all group shrink-0 cursor-pointer"
        aria-label="Toggle notifications menu"
      >
        <Bell size={16} className={`text-white/80 group-hover:text-white transition-colors ${unreadCount > 0 ? 'animate-bounce text-[#c7c42a]' : ''}`} />
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#c7c42a] text-[9px] font-black text-black ring-2 ring-black">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown Card */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 md:w-96 bg-[#080808] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-enter">
          {/* Header section */}
          <div className="p-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-[#c7c42a] tracking-widest bg-[#c7c42a]/10 px-2 py-0.5 rounded leading-none">SYSTEM LAYER</span>
              <h3 className="text-xs font-black uppercase tracking-wider text-white">Security Alerts</h3>
            </div>
            {unreadCount > 0 && (
              <span className="text-[9px] font-black text-[#c7c42a] uppercase bg-[#c7c42a]/15 px-2 py-1 rounded-sm italic">
                {unreadCount} New Active
              </span>
            )}
          </div>

          {/* Quick OneSignal Permission warning block */}
          {permissionState !== 'granted' && (
            <div className="m-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-start gap-2.5">
              <ShieldAlert className="text-yellow-500 shrink-0 mt-0.5" size={14} />
              <div className="flex-1 space-y-2">
                <p className="text-[10px] text-yellow-500/90 font-medium italic leading-relaxed">
                  Browser alerting is inactive. Toggle permissions to secure live desktop notifications.
                </p>
                <button
                  onClick={handleRequestPermission}
                  className="bg-[#c7c42a] hover:bg-white text-black text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg transition-colors leading-none cursor-pointer"
                >
                  Enable Chrome Alerts
                </button>
              </div>
            </div>
          )}

          {/* Notifications Scroll container */}
          <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
            {activeNotifs.length > 0 ? (
              activeNotifs.map((notif) => (
                <div key={notif.id} className={`p-4 hover:bg-white/5 transition-colors ${!notif.read ? 'bg-white/[0.02]' : 'opacity-60'}`}>
                  <div className="flex items-start">
                    <div className="mt-0.5 shrink-0">
                      <div className="w-7 h-7 bg-white/5 rounded-lg flex items-center justify-center text-white/50">
                        {notif.type === 'progress' && <CheckCircle2 size={14} className="text-[#c7c42a]" />}
                        {notif.type === 'system' && <Bell size={14} />}
                        {notif.type === 'admin' && <Bell size={14} />}
                        {(notif as any).type === 'new_message' && <MessageSquare size={14} />}
                        {(notif as any).type === 'meeting' && <Video size={14} />}
                      </div>
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-[10px] font-black uppercase text-white tracking-widest">{notif.title}</h4>
                        {!notif.read && (
                          <button
                            onClick={() => markAsRead(notif.id)}
                            className="p-1 hover:bg-white/10 rounded-md text-[#c7c42a] hover:text-white transition-colors"
                            title="Mark as read"
                          >
                            <Check size={10} />
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-white/40 font-medium leading-relaxed mt-1 italic">{notif.description}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 px-6 text-center space-y-2">
                <Bell size={24} className="mx-auto text-white/10" />
                <p className="text-[11px] text-white/30 uppercase font-black tracking-widest">Workspace Clean</p>
                <p className="text-[10px] text-white/20 italic">No in-app notifications found.</p>
              </div>
            )}
          </div>

          {/* Footer Quick access */}
          <div className="bg-white/5 p-3.5 border-t border-white/5 text-center flex items-center justify-between">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-[10px] font-black text-[#c7c42a] uppercase hover:underline italic tracking-widest block"
            >
              Config Web Push ↗
            </Link>
            <span className="text-[8px] font-mono text-white/20 uppercase">WebbyLaunch Native SW</span>
          </div>
        </div>
      )}
    </div>
  );
}
