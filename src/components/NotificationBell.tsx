"use client";

import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Bell } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { auth } from "../firebase";
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "../services/database";
import { Notification } from "../types";
import { cn, formatDate } from "../lib/utils";

function Dot({ className }: { className?: string }) {
  return (
    <svg
      width="6"
      height="6"
      fill="currentColor"
      viewBox="0 0 6 6"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="3" cy="3" r="3" />
    </svg>
  );
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevNotificationsCount = useRef(0);

  useEffect(() => {
    if (!auth.currentUser) return;

    const unsubscribe = getNotifications(auth.currentUser.uid, (newNotifications) => {
      // Play sound if new unread notification arrives
      const newUnread = newNotifications.filter(n => !n.read).length;
      if (newNotifications.length > prevNotificationsCount.current && newUnread > unreadCount) {
        if (audioRef.current) {
          audioRef.current.play().catch(e => console.log("Audio play failed:", e));
        }
      }
      
      setNotifications(newNotifications);
      setUnreadCount(newUnread);
      prevNotificationsCount.current = newNotifications.length;
    });

    return () => unsubscribe();
  }, [unreadCount]);

  const handleMarkAllAsRead = async () => {
    if (!auth.currentUser) return;
    await markAllNotificationsAsRead(auth.currentUser.uid);
  };

  const handleNotificationClick = async (id: string) => {
    await markNotificationAsRead(id);
  };

  return (
    <>
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" preload="auto" />
      <Popover>
        <PopoverTrigger asChild>
          <Button size="icon" variant="outline" className="relative bg-white/5 border-white/10 hover:bg-white/10 text-white" aria-label="Open notifications">
            <Bell size={16} strokeWidth={2} aria-hidden="true" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-2 left-full min-w-5 -translate-x-1/2 px-1 bg-[#E6FF00] text-black border-none">
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-1 bg-black border-white/10 text-white">
          <div className="flex items-baseline justify-between gap-4 px-3 py-2">
            <div className="text-sm font-semibold">Notifications</div>
            {unreadCount > 0 && (
              <button className="text-xs font-medium text-[#E6FF00] hover:underline" onClick={handleMarkAllAsRead}>
                Mark all as read
              </button>
            )}
          </div>
          <div
            role="separator"
            aria-orientation="horizontal"
            className="-mx-1 my-1 h-px bg-white/10"
          ></div>
          <div className="max-h-[300px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-3 py-8 text-center text-white/40 text-xs">
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm transition-colors hover:bg-white/5",
                    !notification.read && "bg-white/5"
                  )}
                >
                  <div className="relative flex items-start pe-3">
                    <div className="flex-1 space-y-1">
                      <button
                        className="text-left text-white/80 after:absolute after:inset-0"
                        onClick={() => handleNotificationClick(notification.id)}
                      >
                        <span className="font-medium text-white">
                          {notification.title}
                        </span>
                        <p className="text-xs text-white/60 line-clamp-2">
                          {notification.description}
                        </p>
                      </button>
                      <div className="text-[10px] text-white/40">{formatDate(notification.createdAt, 'chat')}</div>
                    </div>
                    {!notification.read && (
                      <div className="absolute end-0 self-center">
                        <span className="sr-only">Unread</span>
                        <Dot className="text-[#E6FF00]" />
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
