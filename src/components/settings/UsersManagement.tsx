import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit2, 
  UserMinus, 
  UserPlus, 
  Download, 
  ChevronRight, 
  X,
  Mail,
  Phone,
  Building2,
  Calendar,
  CreditCard,
  Video,
  FolderKanban,
  History,
  Trash2,
  AlertTriangle,
  Check
} from 'lucide-react';
import { UserProfile } from '../../types';
import { getProfiles, updateUserProfile } from '../../services/database';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

export const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getProfiles();
      // Filter out developers if needed, but here we show all clients
      setUsers(data.filter(u => u.role === 'client'));
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         u.phone?.includes(searchQuery);
    const matchesPlan = planFilter === 'All' || u.plan === planFilter;
    const matchesStatus = statusFilter === 'All' || u.status === statusFilter;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    try {
      await updateUserProfile(selectedUser.uid, editData);
      toast.success('User updated successfully');
      setIsEditing(false);
      fetchUsers();
      setSelectedUser({ ...selectedUser, ...editData } as UserProfile);
    } catch (error) {
      console.error(error);
      toast.error('Failed to update user');
    }
  };

  const toggleUserStatus = async (user: UserProfile) => {
    const newStatus = user.status === 'inactive' ? 'active' : 'inactive';
    const confirmMsg = `Are you sure you want to ${newStatus === 'inactive' ? 'disable' : 'enable'} this user?`;
    
    if (window.confirm(confirmMsg)) {
      try {
        await updateUserProfile(user.uid, { status: newStatus });
        toast.success(`User ${newStatus === 'inactive' ? 'disabled' : 'enabled'}`);
        fetchUsers();
        if (selectedUser?.uid === user.uid) {
          setSelectedUser({ ...selectedUser, status: newStatus });
        }
      } catch (error) {
        console.error(error);
        toast.error('Operation failed');
      }
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Company', 'Plan', 'Status', 'Joined Date'];
    const rows = filteredUsers.map(u => [
      u.displayName,
      u.email,
      u.phone || 'N/A',
      u.companyName || 'N/A',
      u.plan || 'Standard',
      u.status,
      u.createdAt ? format(new Date((u.createdAt as any).seconds * 1000), 'yyyy-MM-dd') : 'N/A'
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "webbylaunch_users.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalRevenue = users.reduce((acc, u) => {
    const planPrices = { 'Basic': 1499, 'Standard': 3499, 'Premium': 9999 };
    return acc + (planPrices[u.plan || 'Standard'] || 0);
  }, 0);

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Total Clients</p>
          <div className="flex items-end justify-between">
            <h4 className="text-3xl font-black text-white italic tracking-tighter">{users.length}</h4>
            <Users className="text-[#6366F1]/20" size={32} />
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Active Users</p>
          <div className="flex items-end justify-between">
            <h4 className="text-3xl font-black text-white italic tracking-tighter">
              {users.filter(u => u.status === 'active' || u.status === 'online').length}
            </h4>
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Est. Monthly Revenue</p>
          <div className="flex items-end justify-between">
            <h4 className="text-3xl font-black text-[#6366F1] italic tracking-tighter">₹ {totalRevenue.toLocaleString()}</h4>
            <CreditCard className="text-[#6366F1]/20" size={32} />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-white/5 border border-white/10 p-4 rounded-[2rem]">
        <div className="relative w-full lg:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#6366F1] transition-colors" size={18} />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email or phone..."
            className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm text-white outline-none focus:border-[#6366F1]/50 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <select 
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="flex-1 lg:flex-none bg-black/40 border border-white/5 rounded-2xl px-6 py-3 text-xs text-white outline-none focus:border-[#6366F1]/50 transition-all appearance-none"
          >
            <option value="All">All Plans</option>
            <option value="Basic">Basic</option>
            <option value="Standard">Standard</option>
            <option value="Premium">Premium</option>
          </select>

          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 lg:flex-none bg-black/40 border border-white/5 rounded-2xl px-6 py-3 text-xs text-white outline-none focus:border-[#6366F1]/50 transition-all appearance-none"
          >
            <option value="All">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/40">User</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/40">Contact</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/40">Plan</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/40">Status</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/40 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((user) => (
                <tr key={user.uid} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white/5 border border-white/10">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/20">
                            <Users size={20} />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-black text-white uppercase italic tracking-tighter">{user.displayName}</p>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest">{user.companyName || 'No Company'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <p className="text-xs text-white/60">{user.email}</p>
                      <p className="text-[10px] text-white/40">{user.phone || 'No phone'}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                      user.plan === 'Premium' ? 'bg-purple-500/10 text-purple-500' :
                      user.plan === 'Standard' ? 'bg-blue-500/10 text-blue-500' :
                      'bg-gray-500/10 text-gray-400'
                    }`}>
                      {user.plan || 'Standard'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${user.status === 'inactive' ? 'bg-red-500' : 'bg-green-500'}`} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
                        {user.status === 'inactive' ? 'Inactive' : 'Active'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => setSelectedUser(user)}
                      className="p-3 bg-white/5 hover:bg-[#6366F1] hover:text-white rounded-2xl transition-all group-hover:scale-110"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 && (
          <div className="py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/20">
              <Users size={40} />
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-white/40">No users found matching your criteria</p>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setSelectedUser(null);
                setIsEditing(false);
              }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-[#0A0A0A] border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-3xl overflow-hidden bg-white/5 border-2 border-white/10">
                    {selectedUser.photoURL ? (
                      <img src={selectedUser.photoURL} alt={selectedUser.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20">
                        <Users size={32} />
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white leading-none">
                      {selectedUser.displayName}
                    </h2>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="px-3 py-1 bg-white/5 text-white/40 rounded-full text-[8px] font-black uppercase tracking-widest">
                        ID: {selectedUser.uid.slice(0, 8)}...
                      </span>
                      <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                        selectedUser.status === 'inactive' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'
                      }`}>
                        {selectedUser.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      setIsEditing(!isEditing);
                      setEditData(selectedUser);
                    }}
                    className={`p-4 rounded-2xl transition-all ${isEditing ? 'bg-[#6366F1] text-white' : 'bg-white/5 text-white/40 hover:text-white'}`}
                  >
                    <Edit2 size={20} />
                  </button>
                  <button 
                    onClick={() => setSelectedUser(null)}
                    className="p-4 bg-white/5 text-white/40 hover:text-white rounded-2xl transition-all"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                {isEditing ? (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Full Name</label>
                          <input 
                            type="text"
                            value={editData.displayName}
                            onChange={(e) => setEditData({ ...editData, displayName: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm outline-none focus:border-[#6366F1]/50 transition-all"
                          />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Phone Number</label>
                          <input 
                            type="tel"
                            value={editData.phone}
                            onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm outline-none focus:border-[#6366F1]/50 transition-all"
                          />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Subscription Plan</label>
                        <select 
                          value={editData.plan}
                          onChange={(e) => setEditData({ ...editData, plan: e.target.value as any })}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm outline-none focus:border-[#6366F1]/50 transition-all appearance-none"
                        >
                          <option value="Basic">Basic</option>
                          <option value="Standard">Standard</option>
                          <option value="Premium">Premium</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Account Status</label>
                        <select 
                          value={editData.status}
                          onChange={(e) => setEditData({ ...editData, status: e.target.value as any })}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm outline-none focus:border-[#6366F1]/50 transition-all appearance-none"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-4">
                      <button 
                        onClick={() => setIsEditing(false)}
                        className="px-8 py-4 bg-white/5 text-white/40 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-white transition-all"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleUpdateUser}
                        className="px-8 py-4 bg-[#6366F1] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(99,102,241,0.2)]"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Basic Info */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 text-[#6366F1]">
                        <Users size={20} />
                        <h4 className="text-sm font-black uppercase tracking-widest">Basic Information</h4>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                          <Mail className="text-white/20" size={18} />
                          <div>
                            <p className="text-[8px] font-black uppercase tracking-widest text-white/40">Email Address</p>
                            <p className="text-sm text-white">{selectedUser.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                          <Phone className="text-white/20" size={18} />
                          <div>
                            <p className="text-[8px] font-black uppercase tracking-widest text-white/40">Phone Number</p>
                            <p className="text-sm text-white">{selectedUser.phone || 'Not provided'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                          <Building2 className="text-white/20" size={18} />
                          <div>
                            <p className="text-[8px] font-black uppercase tracking-widest text-white/40">Company Name</p>
                            <p className="text-sm text-white">{selectedUser.companyName || 'Not provided'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Account & Subscription */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 text-[#6366F1]">
                        <CreditCard size={20} />
                        <h4 className="text-sm font-black uppercase tracking-widest">Account & Subscription</h4>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                          <Calendar className="text-white/20" size={18} />
                          <div>
                            <p className="text-[8px] font-black uppercase tracking-widest text-white/40">Joined Date</p>
                            <p className="text-sm text-white">
                              {selectedUser.createdAt ? format(new Date((selectedUser.createdAt as any).seconds * 1000), 'MMMM dd, yyyy') : 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                          <History className="text-white/20" size={18} />
                          <div>
                            <p className="text-[8px] font-black uppercase tracking-widest text-white/40">Last Login</p>
                            <p className="text-sm text-white">
                              {selectedUser.lastLogin ? format(new Date((selectedUser.lastLogin as any).seconds * 1000), 'MMM dd, HH:mm') : 'Never'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-[#6366F1]/5 rounded-2xl border border-[#6366F1]/10">
                          <div className="flex items-center gap-4">
                            <CreditCard className="text-[#6366F1]" size={18} />
                            <div>
                              <p className="text-[8px] font-black uppercase tracking-widest text-[#6366F1]/60">Current Plan</p>
                              <p className="text-sm font-black text-white uppercase">{selectedUser.plan || 'Standard'}</p>
                            </div>
                          </div>
                          <span className="px-3 py-1 bg-[#6366F1] text-white rounded-full text-[8px] font-black uppercase tracking-widest">Active</span>
                        </div>
                      </div>
                    </div>

                    {/* Activity Stats */}
                    <div className="col-span-full grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-white/5">
                      <div className="p-6 bg-white/5 rounded-3xl text-center space-y-1">
                        <Video className="mx-auto text-white/20 mb-2" size={20} />
                        <p className="text-[8px] font-black uppercase tracking-widest text-white/40">Total Meetings</p>
                        <p className="text-xl font-black text-white italic tracking-tighter">12</p>
                      </div>
                      <div className="p-6 bg-white/5 rounded-3xl text-center space-y-1">
                        <FolderKanban className="mx-auto text-white/20 mb-2" size={20} />
                        <p className="text-[8px] font-black uppercase tracking-widest text-white/40">Active Projects</p>
                        <p className="text-xl font-black text-white italic tracking-tighter">1</p>
                      </div>
                      <div className="p-6 bg-white/5 rounded-3xl text-center space-y-1">
                        <Check className="mx-auto text-white/20 mb-2" size={20} />
                        <p className="text-[8px] font-black uppercase tracking-widest text-white/40">Completed</p>
                        <p className="text-xl font-black text-white italic tracking-tighter">4</p>
                      </div>
                      <div className="p-6 bg-white/5 rounded-3xl text-center space-y-1">
                        <AlertTriangle className="mx-auto text-white/20 mb-2" size={20} />
                        <p className="text-[8px] font-black uppercase tracking-widest text-white/40">Missed Calls</p>
                        <p className="text-xl font-black text-red-500 italic tracking-tighter">0</p>
                      </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="col-span-full pt-10 border-t border-white/5">
                      <div className="bg-red-500/5 border border-red-500/10 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="space-y-1 text-center md:text-left">
                          <h5 className="text-lg font-black uppercase italic tracking-tighter text-red-500">Account Management</h5>
                          <p className="text-white/40 text-xs italic">Disable or permanently remove this user account from the system.</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => toggleUserStatus(selectedUser)}
                            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                              selectedUser.status === 'inactive' ? 'bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white' : 'bg-[#6366F1]/10 text-[#6366F1] hover:bg-[#6366F1] hover:text-white'
                            }`}
                          >
                            {selectedUser.status === 'inactive' ? <UserPlus className="inline mr-2" size={14} /> : <UserMinus className="inline mr-2" size={14} />}
                            {selectedUser.status === 'inactive' ? 'Enable User' : 'Disable User'}
                          </button>
                          <button className="px-6 py-3 bg-red-500/10 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
                            <Trash2 className="inline mr-2" size={14} />
                            Delete User
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
