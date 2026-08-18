import React, { useState } from 'react';
import { User, CompanySettings, DepartmentId } from '../../types';
import { DEPARTMENTS } from '../../data/initialData';
import { X, ShieldCheck, KeyRound, UserPlus, Trash2, Building2, Cloud } from 'lucide-react';

interface AdminSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onSaveUsers: (users: User[]) => void;
  companySettings: CompanySettings;
  onSaveCompanySettings: (settings: CompanySettings) => void;
  onSaveAll: () => void;
}

export const AdminSettingsModal: React.FC<AdminSettingsModalProps> = ({
  isOpen,
  onClose,
  users,
  onSaveUsers,
  companySettings,
  onSaveCompanySettings,
  onSaveAll,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'company'>('users');
  const [userList, setUserList] = useState<User[]>(users);
  const [settings, setSettings] = useState<CompanySettings>(companySettings);
  const [isSyncing, setIsSyncing] = useState(false);

  const [newName, setNewName] = useState('');
  const [newPin, setNewPin] = useState('');
  const [newDeptId, setNewDeptId] = useState<DepartmentId>('design');
  const [newRole, setNewRole] = useState<'admin' | 'staff'>('staff');

  if (!isOpen) return null;

  const handleUpdatePin = (userId: string, pin: string) => {
    if (pin.length > 4) return;
    setUserList(userList.map((u) => (u.id === userId ? { ...u, pin } : u)));
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || newPin.length !== 4) {
      alert('Please enter a valid user name and exact 4-digit PIN.');
      return;
    }
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: newName.trim(),
      pin: newPin,
      role: newRole,
      departmentId: newRole === 'admin' ? 'all' : newDeptId,
      email: `${newName.toLowerCase().replace(/\s+/g, '')}@thulirdesign-qs.com`,
      avatarColor: 'bg-emerald-700',
    };
    const updated = [...userList, newUser];
    setUserList(updated);
    onSaveUsers(updated);
    setNewName('');
    setNewPin('');
  };

  const handleDeleteUser = (userId: string) => {
    if (userList.length <= 1) {
      alert('Cannot delete the final remaining system user.');
      return;
    }
    const updated = userList.filter((u) => u.id !== userId);
    setUserList(updated);
    onSaveUsers(updated);
  };

  const handleSaveAllUsers = async () => {
    setIsSyncing(true);
    onSaveUsers(userList);
    try {
      await onSaveAll();
      const hint = document.getElementById('user-save-hint');
      if (hint) {
        hint.textContent = '✓ Synced to Cloud!';
        hint.className = 'text-xs text-emerald-400 font-bold';
        setTimeout(() => { hint.textContent = ''; hint.className = 'text-xs text-slate-500'; }, 2500);
      }
    } catch (err) { alert('Cloud sync failed.'); }
    setIsSyncing(false);
  };

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSyncing(true);
    onSaveCompanySettings(settings);
    try {
      await onSaveAll();
      const hint = document.getElementById('admin-save-hint');
      if (hint) {
        hint.textContent = '✓ Synced to Cloud!';
        hint.className = 'text-xs text-emerald-400 font-bold';
        setTimeout(() => { hint.textContent = ''; hint.className = 'text-xs text-slate-500'; }, 2500);
      }
    } catch (err) { alert('Cloud sync failed.'); }
    setIsSyncing(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl p-6 relative my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <span>Admin Settings & User PIN Management</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex space-x-2 my-4 border-b border-slate-800 pb-2 text-xs font-bold">
          <button onClick={() => setActiveTab('users')} className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${activeTab === 'users' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
            <KeyRound className="w-4 h-4" />
            <span>Manage Users & 4-Digit PINs</span>
          </button>
          <button onClick={() => setActiveTab('company')} className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${activeTab === 'company' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
            <Building2 className="w-4 h-4" />
            <span>Company Profile & Currency</span>
          </button>
        </div>

        {activeTab === 'users' && (
          <div className="space-y-6 text-xs">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold uppercase text-slate-300">Current Users & Security PINs</label>
                <button onClick={handleSaveAllUsers} disabled={isSyncing} className="flex items-center space-x-1.5 text-xs font-bold text-emerald-400 hover:underline disabled:opacity-50">
                  <Cloud className={`w-3.5 h-3.5 ${isSyncing ? 'animate-pulse' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Save & Sync to Cloud'}</span>
                </button>
                <span id="user-save-hint" className="text-xs text-slate-500"></span>
              </div>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {userList.map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg ${u.avatarColor} text-white flex items-center justify-center font-bold text-xs`}>
                        {u.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-white">{u.name}</p>
                        <p className="text-[10px] text-slate-400 capitalize">{u.role === 'admin' ? 'Admin' : `${u.departmentId} Staff`}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg">
                        <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="text-[10px] text-slate-400">PIN:</span>
                        <input type="text" maxLength={4} value={u.pin} onChange={(e) => handleUpdatePin(u.id, e.target.value)} className="w-12 bg-slate-950 border border-slate-700 font-mono font-bold text-center text-white rounded px-1 text-xs focus:border-indigo-500" />
                      </div>
                      <button onClick={() => handleDeleteUser(u.id)} className="p-1.5 hover:bg-rose-950 text-slate-500 hover:text-rose-400 rounded-lg transition-colors" title="
