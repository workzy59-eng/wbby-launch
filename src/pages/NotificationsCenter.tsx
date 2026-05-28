import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Shield, 
  Send, 
  Terminal, 
  BookOpen, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  Copy,
  Check,
  Zap,
  User,
  ExternalLink,
  MessageSquare,
  DollarSign,
  Briefcase,
  Play,
  RotateCcw
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { requestNotificationPermission, dispatchPushNotification } from '../services/onesignal';
import { toast } from 'react-hot-toast';

export default function NotificationsCenter() {
  const { user } = useAuth();
  const { initializeOneSignalPush } = useNotifications();
  
  const [permissionState, setPermissionState] = useState<string>('default');
  const [isSending, setIsSending] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'interactive' | 'blueprint'>('interactive');
  const [blueprintSubTab, setBlueprintSubTab] = useState<'nextjs' | 'serviceworker' | 'backend' | 'env'>('nextjs');

  // Interactive push configuration
  const [notificationTitle, setNotificationTitle] = useState('Project Milestone Completed!');
  const [notificationBody, setNotificationBody] = useState('Your premium website is fully optimized & live for clients in record time.');
  const [notificationUrl, setNotificationUrl] = useState('https://webbylaunch.vercel.app/dashboard');
  const [notificationCategory, setNotificationCategory] = useState('progress');
  const [targetType, setTargetType] = useState<'broadcast' | 'targeted'>('broadcast');

  // Trigger permission states periodically or once at mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionState(Notification.permission);
    }
  }, []);

  const handleRequestPermission = async () => {
    try {
      const granted = await requestNotificationPermission();
      if (typeof window !== 'undefined' && 'Notification' in window) {
        setPermissionState(Notification.permission);
      }
      if (granted) {
        // Re-init client to latch external players
        await initializeOneSignalPush();
      }
    } catch (err) {
      console.error(err);
      toast.error("Iframe constraints or local settings prevented notification permissions.");
    }
  };

  const handlePresetTrigger = (type: string) => {
    switch (type) {
      case 'project':
        setNotificationTitle('WebbyLaunch Status Update');
        setNotificationBody('Developer completed the localized landing page setup. Awaiting review.');
        setNotificationCategory('progress');
        setNotificationUrl('https://webbylaunch.vercel.app/dashboard');
        break;
      case 'meeting':
        setNotificationTitle('Google Meet Reminder');
        setNotificationBody('Your live launch session is starting in 5 minutes. Join room instantly.');
        setNotificationCategory('meeting');
        setNotificationUrl('https://meet.google.com');
        break;
      case 'payment':
        setNotificationTitle('Invoice Secured Successfully');
        setNotificationBody('Received premium payment milestone. Your web server assets have initiated boot sequences.');
        setNotificationCategory('payment');
        setNotificationUrl('https://webbylaunch.vercel.app/pricing');
        break;
      case 'completed':
        setNotificationTitle('Website Deployment Live');
        setNotificationBody('Your server is live at production-grade endpoint webbylaunch.com in 52 hours!');
        setNotificationCategory('system');
        setNotificationUrl('https://webbylaunch.vercel.app');
        break;
      case 'message':
        setNotificationTitle('New Message from Support');
        setNotificationBody('An expert web engineer submitted code optimizations for your gym layout.');
        setNotificationCategory('new_message');
        setNotificationUrl('https://webbylaunch.vercel.app/messages');
        break;
      default:
        break;
    }
    toast.success("Loaded preset template! Tap Dispatch below to check outcome.", { icon: '📝' });
  };

  const executePushTrigger = async () => {
    setIsSending(true);
    try {
      const payload = {
        title: notificationTitle,
        description: notificationBody,
        url: notificationUrl,
        category: notificationCategory,
        specificUserId: targetType === 'targeted' ? user?.uid : undefined
      };

      const result = await dispatchPushNotification(payload);

      if (result.success) {
        if (result.simulated) {
          toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-[#080808] border border-[#c7c42a] shadow-2xl rounded-2xl pointer-events-auto flex p-4`}>
              <div className="flex-1">
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-[#c7c42a]/10 flex items-center justify-center shrink-0 text-[#c7c42a]">
                    <Bell size={16} />
                  </div>
                  <div className="ml-3">
                    <span className="text-[10px] font-black uppercase text-[#c7c42a] tracking-widest block">Simulated Push (Fallback)</span>
                    <h4 className="text-white text-xs font-bold mt-1 uppercase leading-snug">{payload.title}</h4>
                    <p className="text-white/50 text-[11px] font-medium leading-relaxed mt-0.5">{payload.description}</p>
                  </div>
                </div>
              </div>
            </div>
          ), { duration: 6000, position: 'bottom-right' });

          toast.success("Sandbox Simulation Mode: Local Toast triggered. Add ONESIGNAL keys to lock live push!", { icon: '🚀' });
        } else {
          toast.success("Broadcasting Push via live Google Chrome & OneSignal API!", { icon: '🔥' });
        }
      } else {
        throw new Error(result.error || "Execution failed");
      }
    } catch (err: any) {
      toast.error(`Push API dispatched warning: ${err.message || err}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(id);
    toast.success("Snippet copied perfectly to clipboard.");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Next.js App Router Snippet code
  const nextJsSnippet = `// /app/api/notifications/route.ts (Next.js App Router Production Route)
import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
  try {
    const { title, description, url, category, specificUserId } = await req.json();
    
    const appId = process.env.ONESIGNAL_APP_ID;
    const restKey = process.env.ONESIGNAL_REST_API_KEY;

    if (!appId || !restKey) {
      return NextResponse.json({
        success: true,
        simulated: true,
        message: "OneSignal keys missing in serverless env. Mock mode triggered."
      });
    }

    const payload: any = {
      app_id: appId,
      headings: { en: title },
      contents: { en: description },
      url: url || "https://webbylaunch.com/dashboard",
      chrome_web_badge: "https://webbylaunch.com/favicon.svg",
      chrome_web_icon: "https://webbylaunch.com/favicon.svg",
      data: { category }
    };

    if (specificUserId) {
      payload.include_aliases = { external_id: [specificUserId] };
      payload.target_channel = "push";
    } else {
      payload.included_segments = ["Subscribed Users"];
    }

    const response = await axios.post("https://onesignal.com/api/v1/notifications", payload, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": \`Basic \${restKey}\`
      }
    });

    return NextResponse.json({ success: true, response: response.data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.response?.data || error.message },
      { status: 500 }
    );
  }
}`;

  // Service Worker SDK import code
  const swSnippet = `// Place in public directory exactly as /public/OneSignalSDKWorker.js
// This registers with Google Chrome and matches Windows / MacOS system specifications

importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

// Handlers for click events from Chromium notifications drawer
self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click Detected.', event);
  event.notification.close();
  
  const customData = event.notification.data;
  const targetUrl = customData?.clickUrl || event.notification.launchURL || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});`;

  // Backend / Express / APIs setup code
  const expressSnippet = `// server.ts / Express API Route
import axios from "axios";

// Dispatches browser-channel push notifications using OneSignal
app.post("/api/notifications/send", async (req, res) => {
  try {
    const { title, description, url, category, specificUserId } = req.body;
    const appId = process.env.ONESIGNAL_APP_ID;
    const restKey = process.env.ONESIGNAL_REST_API_KEY;

    if (!restKey) {
      return res.json({ success: true, simulated: true, payload: req.body });
    }

    const payload = {
      app_id: appId,
      headings: { en: title },
      contents: { en: description },
      url: url,
      included_segments: specificUserId ? undefined : ["Subscribed Users"],
      include_aliases: specificUserId ? { external_id: [specificUserId] } : undefined,
      target_channel: specificUserId ? "push" : undefined
    };

    const response = await axios.post("https://onesignal.com/api/v1/notifications", payload, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": \`Basic \${restKey}\`
      }
    });

    res.json({ success: true, data: response.data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});`;

  // Environmental Config snippet
  const envSnippet = `# / .env.production
# Secure backend dashboard keys - NEVER expose to browser VITE_ env tags
ONESIGNAL_APP_ID="3a2f3bd4-976d-4959-b9d9-4824b22cdd63"
ONESIGNAL_REST_API_KEY="ZTJiYjg2NzUtNGZjYy00OGI1LWIw..."

# Vite Production builds hide sourcemaps to lock security
VITE_ONESIGNAL_APP_ID="3a2f3bd4-976d-4959-b9d9-4824b22cdd63"`;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#c7c42a] selection:text-black">
      {/* Dynamic Background Design Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="pt-40 pb-24 px-6 md:px-12 max-w-7xl mx-auto relative z-10 space-y-16">
        
        {/* Header Title section */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-white/5 pb-10">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-[#c7c42a]/10 border border-[#c7c42a]/20 px-3 py-1 rounded-full text-xs font-black uppercase text-[#c7c42a] tracking-widest leading-none">
              <Zap size={10} className="animate-pulse" /> Notification Engine Live
            </div>
            <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-white">
              Hyper-Speed Push Setup
            </h1>
            <p className="text-white/40 font-medium italic text-sm md:text-base leading-relaxed">
              Unlock enterprise-class native push dispatchers. Deliver high-retention transactional message protocols directly to client device desktops in under 52 hours.
            </p>
          </div>

          {/* Prompt Toggle Center */}
          <div className="bg-[#080808] border border-white/5 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 shrink-0 w-full md:w-auto">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-white/80">
                  <Bell size={20} className={permissionState === 'granted' ? 'text-[#c7c42a] animate-bounce' : 'text-white/40'} />
                </div>
                <div className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-black ${
                  permissionState === 'granted' ? 'bg-[#c7c42a]' : permissionState === 'denied' ? 'bg-red-500' : 'bg-yellow-500'
                }`} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-white/30 tracking-widest block font-mono">Chrome Status</span>
                <span className="text-xs uppercase font-extrabold text-white">
                  {permissionState === 'granted' ? 'Allowed ✓' : permissionState === 'denied' ? 'Blocked ✕' : 'Awaiting Consent'}
                </span>
              </div>
            </div>

            {permissionState !== 'granted' ? (
              <button
                onClick={handleRequestPermission}
                className="w-full sm:w-auto bg-[#c7c42a] text-black hover:scale-105 active:scale-95 transition-all text-xs font-black uppercase tracking-wider py-3.5 px-6 rounded-xl shrink-0"
              >
                Enable Desktop Alerts
              </button>
            ) : (
              <div className="bg-white/5 px-4 py-2.5 rounded-xl border border-white/5 text-[11px] font-bold text-white/40 uppercase tracking-wider italic">
                Device Authorized
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Interactive Navigation tabs */}
        <div className="flex bg-[#080808] border border-white/5 rounded-xl p-1 max-w-md">
          <button 
            onClick={() => setActiveTab('interactive')}
            className={`flex-1 py-3 text-xs uppercase font-black tracking-widest flex items-center justify-center gap-2 rounded-lg transition-all ${
              activeTab === 'interactive' ? 'bg-white/5 text-[#c7c42a]' : 'text-white/40 hover:text-white'
            }`}
          >
            <Play size={14} /> Interactive Sandbox
          </button>
          <button 
            onClick={() => setActiveTab('blueprint')}
            className={`flex-1 py-3 text-xs uppercase font-black tracking-widest flex items-center justify-center gap-2 rounded-lg transition-all ${
              activeTab === 'blueprint' ? 'bg-white/5 text-[#c7c42a]' : 'text-white/40 hover:text-white'
            }`}
          >
            <BookOpen size={14} /> Developer Blueprint
          </button>
        </div>

        {/* Layout Switch Panels */}
        <AnimatePresence mode="wait">
          {activeTab === 'interactive' && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-10"
            >
              {/* Sandbox Controls Column */}
              <div className="lg:col-span-8 bg-[#080808] border border-white/5 rounded-[2rem] p-8 md:p-12 space-y-10">
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-[#c7c42a] uppercase tracking-[0.3em] font-black block">Section A</span>
                  <h3 className="text-2xl font-black uppercase italic text-white tracking-tight">Notification Dispatcher</h3>
                  <p className="text-xs text-white/40 leading-relaxed font-medium italic">
                    Trigger genuine native browser pushes through OneSignal. Double-click the presets below to pre-hydrate transactional templates instantly.
                  </p>
                </div>

                {/* Grid of preset buttons */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <button
                    onClick={() => handlePresetTrigger('project')}
                    className="bg-[#111] border border-white/5 hover:border-[#c7c42a]/30 p-3 rounded-xl hover:bg-black text-left group transition-all"
                  >
                    <Briefcase size={16} className="text-[#c7c42a] mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] uppercase font-black text-white tracking-wider block">Project Spec</span>
                    <span className="text-[9px] font-medium text-white/30 italic">Timeline Update</span>
                  </button>

                  <button
                    onClick={() => handlePresetTrigger('meeting')}
                    className="bg-[#111] border border-white/5 hover:border-[#c7c42a]/30 p-3 rounded-xl hover:bg-black text-left group transition-all"
                  >
                    <MessageSquare size={16} className="text-[#c7c42a] mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] uppercase font-black text-white tracking-wider block">Google Meet</span>
                    <span className="text-[9px] font-medium text-white/30 italic">Meeting Prompt</span>
                  </button>

                  <button
                    onClick={() => handlePresetTrigger('payment')}
                    className="bg-[#111] border border-white/5 hover:border-[#c7c42a]/30 p-3 rounded-xl hover:bg-black text-left group transition-all"
                  >
                    <DollarSign size={16} className="text-[#c7c42a] mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] uppercase font-black text-white tracking-wider block">Milestone Invoice</span>
                    <span className="text-[9px] font-medium text-white/30 italic">Payment Received</span>
                  </button>

                  <button
                    onClick={() => handlePresetTrigger('completed')}
                    className="bg-[#111] border border-white/5 hover:border-[#c7c42a]/30 p-3 rounded-xl hover:bg-black text-left group transition-all"
                  >
                    <CheckCircle2 size={16} className="text-[#c7c42a] mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] uppercase font-black text-white tracking-wider block">Server Live</span>
                    <span className="text-[9px] font-medium text-white/30 italic">52 Hrs Completed</span>
                  </button>

                  <button
                    onClick={() => handlePresetTrigger('message')}
                    className="bg-[#111] border border-white/5 hover:border-[#c7c42a]/30 p-3 rounded-xl hover:bg-black text-left col-span-2 md:col-span-1 group transition-all"
                  >
                    <User size={16} className="text-[#c7c42a] mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] uppercase font-black text-white tracking-wider block">Direct Chat</span>
                    <span className="text-[9px] font-medium text-white/30 italic">Client Request</span>
                  </button>
                </div>

                {/* Input Fields block */}
                <div className="space-y-6 pt-4 border-t border-white/5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-white/40 tracking-widest font-mono">Notification Header Title</label>
                      <input 
                        type="text" 
                        value={notificationTitle}
                        onChange={(e) => setNotificationTitle(e.target.value)}
                        className="w-full bg-[#111] border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white focus:border-[#c7c42a] outline-none transition-colors"
                        placeholder="Milestone Approved ✓"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-white/40 tracking-widest font-mono">Category / Channel Icon</label>
                      <select 
                        value={notificationCategory}
                        onChange={(e) => setNotificationCategory(e.target.value)}
                        className="w-full bg-[#111] border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white focus:border-[#c7c42a] outline-none transition-colors"
                      >
                        <option value="progress">Milestone Speed Update (Checkmark Icon)</option>
                        <option value="meeting">Call Reminder (Video Icon)</option>
                        <option value="system">WebbyLaunch Deployment (Logo Badging)</option>
                        <option value="new_message">Live Client Chat (Message Bubble Icon)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-white/40 tracking-widest font-mono">Notification Description Body</label>
                    <textarea 
                      value={notificationBody}
                      onChange={(e) => setNotificationBody(e.target.value)}
                      rows={3}
                      className="w-full bg-[#111] border border-white/5 rounded-xl p-4 text-xs font-bold text-white focus:border-[#c7c42a] outline-none transition-colors resize-none"
                      placeholder="Input the core transactional micro-copy details..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-white/40 tracking-widest font-mono">Click Redirect URL Dest</label>
                      <input 
                        type="url" 
                        value={notificationUrl}
                        onChange={(e) => setNotificationUrl(e.target.value)}
                        className="w-full bg-[#111] border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white focus:border-[#c7c42a] outline-none transition-colors"
                        placeholder="https://webbylaunch.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-white/40 tracking-widest font-mono">Target Recipient Address</label>
                      <div className="grid grid-cols-2 gap-2 bg-[#111] border border-white/5 rounded-xl p-1">
                        <button
                          type="button"
                          onClick={() => setTargetType('broadcast')}
                          className={`py-2 text-[10px] uppercase font-black tracking-wider rounded-lg transition-all ${
                            targetType === 'broadcast' ? 'bg-white/5 text-[#c7c42a]' : 'text-white/30 hover:text-white'
                          }`}
                        >
                          All Subscribed
                        </button>
                        <button
                          type="button"
                          onClick={() => setTargetType('targeted')}
                          className={`py-2 text-[10px] uppercase font-black tracking-wider rounded-lg transition-all ${
                            targetType === 'targeted' ? 'bg-white/5 text-[#c7c42a]' : 'text-white/30 hover:text-white'
                          }`}
                        >
                          Only My UID
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <p className="text-[11px] text-white/30 font-medium italic">
                    Push parameters will format natively for Google Chrome drawer drawer specifications on MacOS and Windows 11.
                  </p>
                  
                  <button
                    onClick={executePushTrigger}
                    disabled={isSending}
                    className="w-full sm:w-auto bg-white text-black hover:bg-[#c7c42a] active:scale-95 transition-all text-xs font-black uppercase tracking-widest py-4 px-8 rounded-xl flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    {isSending ? 'Dispatching Broadcast...' : 'Execute Push Notification'}
                    <Send size={14} />
                  </button>
                </div>
              </div>

              {/* Payload Preview Sidebar Column */}
              <div className="lg:col-span-4 bg-[#080808] border border-white/5 rounded-[2rem] p-8 flex flex-col justify-between space-y-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <Terminal size={14} className="text-[#c7c42a]" />
                    <span className="text-[10px] font-black uppercase text-white/40 tracking-widest font-mono">Real-Time Payload JSON</span>
                  </div>

                  <div className="bg-black/40 border border-white/5 rounded-2xl p-6 font-mono text-[11px] text-white/65 space-y-4 overflow-x-auto leading-relaxed">
                    <div>
                      <span className="text-yellow-500 font-bold">&#123;</span>
                      <div className="pl-4">
                        <span className="text-[#c7c42a]">"app_id"</span>: <span className="text-emerald-400">"{user ? "3a2f3bd4-976d..." : "DEFAULT_ONESIGNAL_ID"}"</span>,
                      </div>
                      <div className="pl-4">
                        <span className="text-[#c7c42a]">"headings"</span>: <span className="text-orange-400">&#123;</span> <span className="text-[#c7c42a]">"en"</span>: <span className="text-emerald-400">"{notificationTitle}"</span> <span className="text-orange-400">&#125;</span>,
                      </div>
                      <div className="pl-4">
                        <span className="text-[#c7c42a]">"contents"</span>: <span className="text-orange-400">&#123;</span> <span className="text-[#c7c42a]">"en"</span>: <span className="text-emerald-400">"{notificationBody.length > 40 ? notificationBody.substring(0, 40) + '...' : notificationBody}"</span> <span className="text-orange-400">&#125;</span>,
                      </div>
                      <div className="pl-4">
                        <span className="text-[#c7c42a]">"url"</span>: <span className="text-emerald-400">"{notificationUrl}"</span>,
                      </div>
                      <div className="pl-4">
                        <span className="text-[#c7c42a]">"data"</span>: <span className="text-orange-400">&#123;</span>
                        <div className="pl-4">
                          <span className="text-[#c7c42a]">"category"</span>: <span className="text-emerald-400">"{notificationCategory}"</span>
                        </div>
                        <span className="text-orange-400">&#125;</span>,
                      </div>
                      <div className="pl-4">
                        <span className="text-[#c7c42a]">{targetType === 'targeted' ? '"include_aliases"' : '"included_segments"'}</span>: <span className="text-emerald-400">{targetType === 'targeted' ? '{"external_id": ["' + (user?.uid?.substring(0, 8) || 'USER_ID_MATCH') + '..."]}' : '["Subscribed Users"]'}</span>
                      </div>
                      <span className="text-yellow-500 font-bold">&#125;</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#111] rounded-2xl p-6 border border-white/5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Shield size={14} className="text-[#c7c42a]" />
                    <span className="text-[10px] font-mono text-white/50 uppercase font-black uppercase tracking-widest">Security Safeguard</span>
                  </div>
                  <p className="text-[11px] text-white/55 italic leading-relaxed">
                    Browser Web Push restricts unauthorized API access. The frontend must dispatch the notification through the server-side controller, safeguarding the secret OneSignal App REST key from malicious public exposure.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'blueprint' && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-10"
            >
              {/* Document Selection Tabs */}
              <div className="lg:col-span-3 flex flex-row lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0">
                <button
                  onClick={() => setBlueprintSubTab('nextjs')}
                  className={`w-full text-left p-4 rounded-xl text-xs uppercase font-black tracking-wider shrink-0 transition-colors border select-none ${
                    blueprintSubTab === 'nextjs' 
                      ? 'bg-[#c7c42a]/10 border-[#c7c42a] text-[#c7c42a]' 
                      : 'bg-[#080808] border-white/5 text-white/40 hover:text-white'
                  }`}
                >
                  01 / Next.js Setup
                </button>
                <button
                  onClick={() => setBlueprintSubTab('serviceworker')}
                  className={`w-full text-left p-4 rounded-xl text-xs uppercase font-black tracking-wider shrink-0 transition-colors border select-none ${
                    blueprintSubTab === 'serviceworker' 
                      ? 'bg-[#c7c42a]/10 border-[#c7c42a] text-[#c7c42a]' 
                      : 'bg-[#080808] border-white/5 text-white/40 hover:text-white'
                  }`}
                >
                  02 / Service Worker
                </button>
                <button
                  onClick={() => setBlueprintSubTab('backend')}
                  className={`w-full text-left p-4 rounded-xl text-xs uppercase font-black tracking-wider shrink-0 transition-colors border select-none ${
                    blueprintSubTab === 'backend' 
                      ? 'bg-[#c7c42a]/10 border-[#c7c42a] text-[#c7c42a]' 
                      : 'bg-[#080808] border-white/5 text-white/40 hover:text-white'
                  }`}
                >
                  03 / API route
                </button>
                <button
                  onClick={() => setBlueprintSubTab('env')}
                  className={`w-full text-left p-4 rounded-xl text-xs uppercase font-black tracking-wider shrink-0 transition-colors border select-none ${
                    blueprintSubTab === 'env' 
                      ? 'bg-[#c7c42a]/10 border-[#c7c42a] text-[#c7c42a]' 
                      : 'bg-[#080808] border-white/5 text-white/40 hover:text-white'
                  }`}
                >
                  04 / Environment
                </button>
              </div>

              {/* Document Viewer block */}
              <div className="lg:col-span-9 bg-[#080808] border border-white/5 rounded-[2rem] p-8 md:p-12 space-y-6">
                
                {/* 1. NextJS */}
                {blueprintSubTab === 'nextjs' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xl font-black uppercase italic text-white tracking-tight">Next.js App Router Integration</h4>
                        <p className="text-xs text-white/40 mt-1 font-medium italic">Deploy push integrations flawlessly with Vercel Serverless environment configurations.</p>
                      </div>
                      <button 
                        onClick={() => handleCopyCode('njs', nextJsSnippet)}
                        className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-white/60 hover:text-white transition-all flex items-center justify-center cursor-pointer"
                      >
                        {copiedIndex === 'njs' ? <Check size={14} className="text-[#c7c42a]" /> : <Copy size={14} />}
                      </button>
                    </div>

                    <pre className="bg-black/50 p-6 rounded-2xl overflow-x-auto text-[11px] font-mono text-white/60 leading-relaxed max-h-[400px]">
                      <code>{nextJsSnippet}</code>
                    </pre>
                  </div>
                )}

                {/* 2. Service Worker */}
                {blueprintSubTab === 'serviceworker' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xl font-black uppercase italic text-white tracking-tight">Service Worker Setup (`OneSignalSDKWorker.js`)</h4>
                        <p className="text-xs text-white/40 mt-1 font-medium italic">Enables Chromium background system processing, drawer caching, and dynamic launch redirects.</p>
                      </div>
                      <button 
                        onClick={() => handleCopyCode('sw', swSnippet)}
                        className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-white/60 hover:text-white transition-all flex items-center justify-center cursor-pointer"
                      >
                        {copiedIndex === 'sw' ? <Check size={14} className="text-[#c7c42a]" /> : <Copy size={14} />}
                      </button>
                    </div>

                    <pre className="bg-black/50 p-6 rounded-2xl overflow-x-auto text-[11px] font-mono text-white/60 leading-relaxed max-h-[400px]">
                      <code>{swSnippet}</code>
                    </pre>
                  </div>
                )}

                {/* 3. Local/Custom API */}
                {blueprintSubTab === 'backend' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xl font-black uppercase italic text-white tracking-tight">Express REST API Broker</h4>
                        <p className="text-xs text-white/40 mt-1 font-medium italic">Our customized full-stack Express service route linking server logic securely to OneSignal servers.</p>
                      </div>
                      <button 
                        onClick={() => handleCopyCode('exp', expressSnippet)}
                        className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-white/60 hover:text-white transition-all flex items-center justify-center cursor-pointer"
                      >
                        {copiedIndex === 'exp' ? <Check size={14} className="text-[#c7c42a]" /> : <Copy size={14} />}
                      </button>
                    </div>

                    <pre className="bg-black/50 p-6 rounded-2xl overflow-x-auto text-[11px] font-mono text-white/60 leading-relaxed max-h-[400px]">
                      <code>{expressSnippet}</code>
                    </pre>
                  </div>
                )}

                {/* 4. Env */}
                {blueprintSubTab === 'env' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xl font-black uppercase italic text-white tracking-tight">Environment Config Template</h4>
                        <p className="text-xs text-white/40 mt-1 font-medium italic">Store secrets safely in Vercel. Ensure NO API keys leak into public client assemblies.</p>
                      </div>
                      <button 
                        onClick={() => handleCopyCode('env', envSnippet)}
                        className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-white/60 hover:text-white transition-all flex items-center justify-center cursor-pointer"
                      >
                        {copiedIndex === 'env' ? <Check size={14} className="text-[#c7c42a]" /> : <Copy size={14} />}
                      </button>
                    </div>

                    <pre className="bg-black/50 p-6 rounded-2xl overflow-x-auto text-[11px] font-mono text-white/60 leading-relaxed max-h-[400px]">
                      <code>{envSnippet}</code>
                    </pre>
                  </div>
                )}

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feature Highlights section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#080808] border border-white/5 p-6 rounded-2xl space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-white">Chromium Compliant</h4>
            <p className="text-[11px] text-white/40 leading-relaxed">
              Tailored specification handles push drawers positioning in Windows systems bottom-right tray and macOS banner trays natively.
            </p>
          </div>

          <div className="bg-[#080808] border border-white/5 p-6 rounded-2xl space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-white">Consolidated Permissioning</h4>
            <p className="text-[11px] text-white/40 leading-relaxed">
              Guarantees browser-level notification permissions request triggers only once, matching low-friction client interaction metrics.
            </p>
          </div>

          <div className="bg-[#080808] border border-white/5 p-6 rounded-2xl space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-white">Secure Redirects</h4>
            <p className="text-[11px] text-white/40 leading-relaxed">
              Background workers decode additional parameters including target navigation paths to route active push-clicks seamlessly without reloading.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
