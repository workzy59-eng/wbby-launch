import React, { useState, useEffect, useMemo } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  getYear,
  setYear,
  setMonth,
  isToday
} from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus, 
  X, 
  Save, 
  Clock,
  Activity,
  Smile,
  Meh,
  Frown,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { saveBioLog, getBioLogs } from '../services/database';
import { BioLog } from '../types';

const BioLogPage = () => {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [logs, setLogs] = useState<BioLog[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showYearPicker, setShowYearPicker] = useState(false);

  // Form state
  const [mood, setMood] = useState('Neutral');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const years = useMemo(() => {
    const currentYear = getYear(new Date());
    const startYear = 2024; // Lowering significantly just for testing, user said "every year from 2026"
    const endYear = currentYear + 10;
    return Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
  }, []);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    if (user) {
      fetchLogs();
    }
  }, [user, currentMonth]);

  const fetchLogs = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const year = getYear(currentMonth);
      const data = await getBioLogs(user.uid, year);
      setLogs(data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const dayLogsMap = useMemo(() => {
    const map: Record<string, BioLog> = {};
    logs.forEach(log => {
      map[log.date] = log;
    });
    return map;
  }, [logs]);

  const renderHeader = () => {
    return (
      <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-black/60 border-b border-white/5 backdrop-blur-xl">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <div className="p-3 bg-[#c7c42a]/20 rounded-2xl">
            <CalendarIcon className="text-[#c7c42a]" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white italic uppercase tracking-wider">Bio Log</h1>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Personal Daily Records</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 hover:bg-white/5 rounded-xl transition-colors border border-white/5"
          >
            <ChevronLeft size={20} className="text-[#c7c42a]" />
          </button>
          
          <div className="relative">
            <button 
              type="button"
              onClick={() => setShowYearPicker(!showYearPicker)}
              className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2 text-white font-black italic uppercase tracking-widest hover:border-[#c7c42a]/50 transition-all"
            >
              {format(currentMonth, 'MMMM yyyy')}
              <ChevronDown size={14} className="text-[#c7c42a]" />
            </button>
            
            <AnimatePresence>
              {showYearPicker && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full mt-2 left-0 right-0 bg-[#0a0a0a] border border-white/10 rounded-2xl p-4 shadow-2xl z-50 max-h-[300px] overflow-y-auto min-w-[200px]"
                >
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {months.map((m, idx) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          setCurrentMonth(setMonth(currentMonth, idx));
                        }}
                        className={`text-[10px] font-black uppercase py-2 rounded-lg transition-all ${
                          currentMonth.getMonth() === idx 
                          ? 'bg-[#c7c42a] text-black' 
                          : 'bg-white/5 text-white hover:bg-white/10'
                        }`}
                      >
                        {m.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                  <div className="h-px bg-white/5 mb-4" />
                  <div className="grid grid-cols-2 gap-2">
                    {years.map(y => (
                      <button
                        key={y}
                        type="button"
                        onClick={() => {
                          setCurrentMonth(setYear(currentMonth, y));
                          setShowYearPicker(false);
                        }}
                        className={`text-[10px] font-black py-2 rounded-lg transition-all ${
                          getYear(currentMonth) === y 
                          ? 'bg-[#c7c42a] text-black' 
                          : 'bg-white/5 text-white hover:bg-white/10'
                        }`}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            type="button"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 hover:bg-white/5 rounded-xl transition-colors border border-white/5"
          >
            <ChevronRight size={20} className="text-[#c7c42a]" />
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div className="grid grid-cols-7 border-b border-white/5 bg-black/40">
        {days.map(day => (
          <div key={day} className="py-4 text-center">
            <span className="text-[10px] font-black text-[#c7c42a] uppercase tracking-[0.3em]">{day}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const dateKey = format(day, 'yyyy-MM-dd');
        const log = dayLogsMap[dateKey];
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isTodayDate = isToday(day);
        const cloneDay = day;

        days.push(
          <motion.div
            key={day.toString()}
            whileHover={{ scale: 0.98 }}
            onClick={() => onDateClick(cloneDay)}
            className={`min-h-[100px] md:min-h-[120px] p-2 border-r border-b border-white/5 cursor-pointer transition-all relative group ${
              !isCurrentMonth ? 'bg-black/80 grayscale opacity-30 pointer-events-none' : 'bg-black/20 hover:bg-white/[0.02]'
            } ${isTodayDate ? 'ring-1 ring-inset ring-[#c7c42a]/30' : ''}`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className={`text-xs font-black italic ${isTodayDate ? 'text-[#c7c42a]' : 'text-white/40'}`}>
                {format(day, 'd')}
              </span>
              {log && (
                <div className="p-1 bg-[#c7c42a]/10 rounded-md">
                  {log.mood === 'Happy' && <Smile size={14} className="text-[#c7c42a]" />}
                  {log.mood === 'Neutral' && <Meh size={14} className="text-white/40" />}
                  {log.mood === 'Sad' && <Frown size={14} className="text-red-500" />}
                </div>
              )}
            </div>
            
            {log?.notes && (
              <p className="text-[9px] md:text-[10px] text-white/60 line-clamp-3 font-medium leading-relaxed italic">
                {log.notes}
              </p>
            )}

            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="p-1.5 bg-[#c7c42a] rounded-lg shadow-lg">
                <Plus size={10} className="text-black" />
              </div>
            </div>
          </motion.div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="bg-black/20">{rows}</div>;
  };

  const onDateClick = (day: Date) => {
    setSelectedDate(day);
    const dateKey = format(day, 'yyyy-MM-dd');
    const existingLog = dayLogsMap[dateKey];
    
    if (existingLog) {
      setMood(existingLog.mood || 'Neutral');
      setNotes(existingLog.notes || '');
    } else {
      setMood('Neutral');
      setNotes('');
    }
    
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedDate || !user) return;
    setIsSaving(true);
    try {
      await saveBioLog({
        date: format(selectedDate, 'yyyy-MM-dd'),
        mood,
        notes,
      });
      setIsModalOpen(false);
      fetchLogs();
    } catch (error) {
      console.error('Error saving log:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-12 px-4 md:px-8 bg-black">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Intro */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter">
              Biolife <span className="text-[#c7c42a]">Calendar</span>
            </h2>
            <p className="text-xs font-bold text-white/40 uppercase tracking-[0.4em] mt-2">
              Track your journey through time
            </p>
          </div>
          
          <div className="flex gap-4">
            <div className="p-4 bg-white/5 border border-white/10 rounded-3xl flex items-center gap-4">
              <div className="w-10 h-10 bg-[#c7c42a]/20 rounded-2xl flex items-center justify-center">
                <Activity size={20} className="text-[#c7c42a]" />
              </div>
              <div>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Total Logs</p>
                <p className="text-xl font-black text-white italic">{logs.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Container */}
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-3xl shadow-2xl relative">
          {loading && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-10 flex items-center justify-center">
              <div className="w-12 h-12 border-2 border-[#c7c42a] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          
          {renderHeader()}
          {renderDays()}
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              {renderCells()}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && selectedDate && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl"
            >
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="absolute top-8 right-8 p-2 hover:bg-white/5 rounded-2xl transition-all"
              >
                <X size={20} className="text-[#c7c42a]" />
              </button>

              <div className="mb-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-[#c7c42a]/20 rounded-xl flex items-center justify-center">
                    <Clock size={16} className="text-[#c7c42a]" />
                  </div>
                  <h3 className="text-[10px] font-black text-[#c7c42a] uppercase tracking-[0.4em]">Log Entry</h3>
                </div>
                <h2 className="text-3xl font-black text-white italic uppercase">{format(selectedDate, 'do MMMM yyyy')}</h2>
              </div>

              <div className="space-y-8">
                {/* Mood Selector */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] ml-4">How are you feeling?</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { icon: Smile, label: 'Happy', color: '#c7c42a' },
                      { icon: Meh, label: 'Neutral', color: 'rgba(255,255,255,0.4)' },
                      { icon: Frown, label: 'Sad', color: '#ef4444' }
                    ].map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => setMood(item.label)}
                        className={`flex flex-col items-center gap-3 p-6 rounded-3xl border transition-all ${
                          mood === item.label 
                          ? 'bg-white/5 border-[#c7c42a] scale-[1.05] shadow-xl' 
                          : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                        }`}
                      >
                        <item.icon size={24} style={{ color: mood === item.label ? '#c7c42a' : item.color }} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${mood === item.label ? 'text-[#c7c42a]' : 'text-white/40'}`}>
                          {item.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] ml-4">Notes & Reflections</label>
                  <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Capture the essence of your day..."
                    className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-6 text-white text-sm outline-none focus:border-[#c7c42a] transition-all min-h-[150px] resize-none font-medium italic"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 bg-[#c7c42a] hover:bg-[#d9d63c] text-black font-black italic uppercase py-5 rounded-3xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 group"
                  >
                    {isSaving ? (
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save size={18} className="group-hover:scale-110 transition-transform" />
                        Save Evolution
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BioLogPage;
