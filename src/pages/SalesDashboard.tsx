import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Phone, 
  TrendingUp, 
  DollarSign, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  MoreVertical,
  ChevronRight,
  ArrowUpRight,
  Target
} from 'lucide-react';
import { db, collection, query, where, onSnapshot, addDoc, updateDoc, doc, serverTimestamp } from '../firebase';
import { UserProfile, Lead, Commission } from '../types';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

interface SalesDashboardProps {
  user: any;
  profile: UserProfile | null;
}

export default function SalesDashboard({ user, profile }: SalesDashboardProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // New Lead State
  const [newLead, setNewLead] = useState({
    businessName: '',
    phone: '',
    businessType: '',
    location: '',
    notes: ''
  });

  useEffect(() => {
    if (!user || !profile || profile.role !== 'sales') return;

    // Fetch Leads assigned to this sales person
    const leadsQuery = query(
      collection(db, 'leads'),
      where('assignedSalesId', '==', user.uid)
    );

    const unsubscribeLeads = onSnapshot(leadsQuery, (snapshot) => {
      const leadsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead));
      setLeads(leadsData.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()));
      setLoading(false);
    }, (error) => {
      console.error("Sales Leads Snapshot Error:", error);
      setLoading(false);
    });

    // Fetch Commissions
    const commissionsQuery = query(
      collection(db, 'commissions'),
      where('salesId', '==', user.uid)
    );

    const unsubscribeCommissions = onSnapshot(commissionsQuery, (snapshot) => {
      const commissionsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Commission));
      setCommissions(commissionsData);
    }, (error) => {
      console.error("Sales Commissions Snapshot Error:", error);
    });

    return () => {
      unsubscribeLeads();
      unsubscribeCommissions();
    };
  }, [user]);

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'leads'), {
        ...newLead,
        status: 'Not Called',
        assignedSalesId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      toast.success('Lead added successfully!');
      setIsAddLeadModalOpen(false);
      setNewLead({ businessName: '', phone: '', businessType: '', location: '', notes: '' });
    } catch (error) {
      console.error('Error adding lead:', error);
      toast.error('Failed to add lead');
    }
  };

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'leads', leadId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.businessName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         lead.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = [
    { label: 'Total Leads', value: leads.length, icon: Users, color: 'text-white' },
    { label: 'Closed Deals', value: leads.filter(l => l.status === 'Closed').length, icon: CheckCircle2, color: 'text-[#c7c42a]' },
    { label: 'Conversion Rate', value: leads.length ? `${Math.round((leads.filter(l => l.status === 'Closed').length / leads.length) * 100)}%` : '0%', icon: TrendingUp, color: 'text-[#c7c42a]' },
    { label: 'Total Commission', value: `₹${commissions.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}`, icon: DollarSign, color: 'text-[#c7c42a]' },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">Sales <span className="text-[#c7c42a]">Dashboard</span></h1>
            <p className="text-white/40 font-medium italic">Welcome back, {profile?.displayName || 'Agent'}. Let's close some deals today.</p>
          </div>
          <button 
            onClick={() => setIsAddLeadModalOpen(true)}
            className="bg-[#c7c42a] text-black px-8 py-4 rounded-2xl font-black uppercase italic flex items-center gap-3 hover:scale-105 transition-all shadow-[0_0_30px_rgba(199,196,42,0.2)]"
          >
            <Plus size={20} /> Add New Lead
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <stat.icon size={64} />
              </div>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">{stat.label}</p>
              <h3 className={`text-4xl font-black tracking-tighter italic ${stat.color}`}>{stat.value}</h3>
            </motion.div>
          ))}
        </div>

        {/* Leads Section */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-3">
              <Target className="text-[#c7c42a]" /> My Leads
            </h2>
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input 
                  type="text" 
                  placeholder="Search leads..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-6 text-sm font-medium focus:outline-none focus:border-[#c7c42a]/50 transition-all w-full md:w-64"
                />
              </div>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl py-3 px-6 text-sm font-black uppercase tracking-widest focus:outline-none focus:border-[#c7c42a]/50 transition-all"
              >
                <option value="All">All Status</option>
                <option value="Not Called">Not Called</option>
                <option value="Called">Called</option>
                <option value="Interested">Interested</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Closed">Closed</option>
                <option value="Not Interested">Not Interested</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredLeads.length > 0 ? (
              filteredLeads.map((lead) => (
                <motion.div
                  key={lead.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:bg-white/[0.07] transition-all group"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-start gap-6">
                      <div className="w-16 h-16 bg-[#c7c42a]/10 rounded-2xl flex items-center justify-center text-[#c7c42a] shrink-0">
                        <Phone size={24} />
                      </div>
                      <div>
                        <h4 className="text-xl font-black uppercase italic tracking-tighter">{lead.businessName}</h4>
                        <div className="flex flex-wrap items-center gap-4 mt-2">
                          <span className="text-white/40 text-xs font-bold flex items-center gap-2">
                            <Phone size={12} /> {lead.phone}
                          </span>
                          <span className="text-white/40 text-xs font-bold flex items-center gap-2">
                            <Calendar size={12} /> {lead.createdAt ? format(lead.createdAt.toDate(), 'MMM dd, yyyy') : 'N/A'}
                          </span>
                          {lead.location && (
                            <span className="text-white/40 text-xs font-bold">📍 {lead.location}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Status</span>
                        <select 
                          value={lead.status}
                          onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                          className={`text-xs font-black uppercase tracking-widest py-2 px-4 rounded-lg border transition-all ${
                            lead.status === 'Closed' ? 'bg-[#c7c42a]/20 border-[#c7c42a] text-[#c7c42a]' :
                            lead.status === 'Interested' ? 'bg-blue-500/20 border-blue-500 text-blue-500' :
                            lead.status === 'Not Called' ? 'bg-white/10 border-white/20 text-white/40' :
                            'bg-orange-500/20 border-orange-500 text-orange-500'
                          }`}
                        >
                          <option value="Not Called">Not Called</option>
                          <option value="Called">Called</option>
                          <option value="Interested">Interested</option>
                          <option value="Follow-up">Follow-up</option>
                          <option value="Closed">Closed</option>
                          <option value="Not Interested">Not Interested</option>
                        </select>
                      </div>
                      
                      <button className="p-4 bg-white/5 rounded-2xl text-white/40 hover:text-white hover:bg-white/10 transition-all">
                        <MessageSquare size={20} />
                      </button>
                      <button className="p-4 bg-white/5 rounded-2xl text-white/40 hover:text-white hover:bg-white/10 transition-all">
                        <MoreVertical size={20} />
                      </button>
                    </div>
                  </div>
                  {lead.notes && (
                    <div className="mt-6 pt-6 border-t border-white/5">
                      <p className="text-sm text-white/40 italic font-medium">
                        <span className="text-white/20 uppercase text-[10px] font-black tracking-widest block mb-1">Notes</span>
                        {lead.notes}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="text-center py-20 bg-white/5 border border-white/10 border-dashed rounded-[3rem]">
                <AlertCircle className="mx-auto text-white/20 mb-4" size={48} />
                <p className="text-white/40 font-black uppercase tracking-widest italic">No leads found matching your criteria</p>
              </div>
            )}
          </div>
        </div>

        {/* Commission History */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-3">
            <DollarSign className="text-[#c7c42a]" /> Commission History
          </h2>
          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40">Date</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40">Amount</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40">Status</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40">Payment ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {commissions.length > 0 ? (
                  commissions.map((comm) => (
                    <tr key={comm.id} className="hover:bg-white/[0.02] transition-all">
                      <td className="p-6 text-sm font-medium text-white/60">
                        {comm.createdAt ? format(comm.createdAt.toDate(), 'MMM dd, yyyy') : 'N/A'}
                      </td>
                      <td className="p-6 text-lg font-black text-[#c7c42a]">₹{comm.amount.toLocaleString()}</td>
                      <td className="p-6">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                          comm.status === 'paid' ? 'bg-[#c7c42a]/20 text-[#c7c42a]' : 'bg-orange-500/20 text-orange-500'
                        }`}>
                          {comm.status}
                        </span>
                      </td>
                      <td className="p-6 text-xs font-mono text-white/20">{comm.paymentId}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-white/20 font-black uppercase tracking-widest italic">
                      No commission records yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Lead Modal */}
      <AnimatePresence>
        {isAddLeadModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddLeadModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-[#0B0B0B] border border-white/10 p-10 rounded-[3rem] w-full max-w-xl shadow-2xl"
            >
              <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-8">Add New <span className="text-[#c7c42a]">Lead</span></h3>
              <form onSubmit={handleAddLead} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Business Name</label>
                    <input 
                      required
                      type="text" 
                      value={newLead.businessName}
                      onChange={(e) => setNewLead({...newLead, businessName: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-[#c7c42a]/50 transition-all font-medium"
                      placeholder="e.g. Iron Pulse Gym"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Phone Number</label>
                    <input 
                      required
                      type="tel" 
                      value={newLead.phone}
                      onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-[#c7c42a]/50 transition-all font-medium"
                      placeholder="e.g. +91 98765 43210"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Business Type</label>
                    <input 
                      type="text" 
                      value={newLead.businessType}
                      onChange={(e) => setNewLead({...newLead, businessType: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-[#c7c42a]/50 transition-all font-medium"
                      placeholder="e.g. Fitness / Gym"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Location</label>
                    <input 
                      type="text" 
                      value={newLead.location}
                      onChange={(e) => setNewLead({...newLead, location: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-[#c7c42a]/50 transition-all font-medium"
                      placeholder="e.g. Mumbai, MH"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Initial Notes</label>
                  <textarea 
                    rows={4}
                    value={newLead.notes}
                    onChange={(e) => setNewLead({...newLead, notes: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-[#c7c42a]/50 transition-all font-medium resize-none"
                    placeholder="Any specific details about the lead..."
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsAddLeadModalOpen(false)}
                    className="flex-1 px-8 py-5 bg-white/5 border border-white/10 rounded-2xl font-black uppercase italic hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-8 py-5 bg-[#c7c42a] text-black rounded-2xl font-black uppercase italic hover:scale-105 transition-all shadow-[0_0_30px_rgba(199,196,42,0.2)]"
                  >
                    Save Lead
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
