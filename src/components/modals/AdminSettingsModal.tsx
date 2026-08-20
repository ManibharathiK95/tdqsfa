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
  isOpen, onClose, users, onSaveUsers, companySettings, onSaveCompanySettings, onSaveAll,
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
    if (!/^\d{0,4}$/.test(pin)) return;
    setUserList(userList.map(u => u.id === userId ? { ...u, pin } : u));
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
    const updated = userList.filter(u => u.id !== userId);
    setUserList(updated);
    onSaveUsers(updated);
  };

  const showHint = (id: string) => {
    const hint = document.getElementById(id);
    if (hint) {
      hint.textContent = '✓ Synced to Cloud!';
      hint.className = 'text-xs font-bold text-emerald-400';
      setTimeout(() => {
        hint.textContent = '';
        hint.className = 'text-xs text-slate-500';
      }, 2500);
    }
  };

  const handleSaveAllUsers = async () => {
    setIsSyncing(true);
    onSaveUsers(userList);
    try {
      await onSaveAll();
      showHint('user-save-hint');
    } catch {
      alert('Cloud sync failed.');
    }
    setIsSyncing(false);
  };

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSyncing(true);
    onSaveCompanySettings(settings);
    try {
      await onSaveAll();
      showHint('admin-save-hint');
    } catch {
      alert('Cloud sync failed.');
    }
    setIsSyncing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="relative my-8 w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">

        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 className="flex items-center gap-2 text-base font-bold text-white">
            <ShieldCheck className="h-5 w-5 text-indigo-400" />
            Admin Settings & User PIN Management
          </h3>
          <button onClick={onClose} className="text-slate-400 transition-colors hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="my-4 flex space-x-2 border-b border-slate-800 pb-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 transition-all ${
              activeTab === 'users'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <KeyRound className="h-4 w-4" />
            <span>Manage Users & 4-Digit PINs</span>
          </button>

          <button
            onClick={() => setActiveTab('company')}
            className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 transition-all ${
              activeTab === 'company'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Building2 className="h-4 w-4" />
            <span>Company Profile & Currency</span>
          </button>
        </div>

        {activeTab === 'users' && (
          <div className="space-y-6 text-xs">

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-xs font-bold uppercase text-slate-300">
                  Current Users & Security PINs
                </label>

                <div className="flex items-center gap-3">
                  <span id="user-save-hint" className="text-xs text-slate-500" />
                  <button
                    onClick={handleSaveAllUsers}
                    disabled={isSyncing}
                    className="flex items-center space-x-1.5 text-xs font-bold text-emerald-400 hover:underline disabled:opacity-50"
                  >
                    <Cloud className={`h-3.5 w-3.5 ${isSyncing ? 'animate-pulse' : ''}`} />
                    <span>{isSyncing ? 'Syncing...' : 'Save & Sync to Cloud'}</span>
                  </button>
                </div>
              </div>

              <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                {userList.map(u => (
                  <div key={u.id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3">

                    <div className="flex items-center space-x-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${u.avatarColor} text-xs font-bold text-white`}>
                        {u.name.substring(0, 2).toUpperCase()}
                      </div>

                      <div>
                        <p className="font-bold text-white">{u.name}</p>
                        <p className="text-[10px] capitalize text-slate-400">
                          {u.role === 'admin' ? 'Admin' : `${u.departmentId} Staff`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1 rounded-lg border border-slate-800 bg-slate-900 px-2 py-1">
                        <KeyRound className="h-3.5 w-3.5 text-indigo-400" />
                        <span className="text-[10px] text-slate-400">PIN:</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={4}
                          value={u.pin}
                          onChange={e => handleUpdatePin(u.id, e.target.value)}
                          className="w-12 rounded border border-slate-700 bg-slate-950 px-1 text-center font-mono text-xs font-bold text-white focus:border-indigo-500"
                        />
                      </div>

                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-rose-950 hover:text-rose-400"
                        title="Delete User"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3 rounded-xl border border-slate-800 bg-slate-950 p-4">
              <label className="flex items-center space-x-1 text-xs font-bold uppercase tracking-wider text-indigo-400">
                <UserPlus className="h-4 w-4" />
                <span>Create New User Account</span>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-slate-400">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="e.g. Alex Engineer"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-slate-400">Set 4-Digit PIN *</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    maxLength={4}
                    value={newPin}
                    onChange={e => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="e.g. 5555"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-center font-mono font-bold text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-slate-400">Assigned Department</label>
                  <select
                    value={newDeptId}
                    onChange={e => setNewDeptId(e.target.value as DepartmentId)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-white"
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-slate-400">System Role</label>
                  <select
                    value={newRole}
                    onChange={e => setNewRole(e.target.value as 'admin' | 'staff')}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-white"
                  >
                    <option value="staff">Department Staff</option>
                    <option value="admin">System Admin</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-indigo-600 py-2 font-bold text-white shadow transition-all hover:bg-indigo-500"
              >
                Create User & Assign PIN
              </button>
            </form>
          </div>
        )}

        {activeTab === 'company' && (
          <form onSubmit={handleSaveCompany} className="space-y-4 text-xs">

            <div>
              <label className="mb-1 block font-semibold text-slate-400">Company Name</label>
              <input
                type="text"
                required
                value={settings.companyName}
                onChange={e => setSettings({ ...settings, companyName: e.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 font-bold text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block font-semibold text-slate-400">Currency Symbol</label>
                <input
                  type="text"
                  required
                  value={settings.currencySymbol}
                  onChange={e => setSettings({ ...settings, currencySymbol: e.target.value })}
                  placeholder="e.g. AED"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 font-mono text-white"
                />
              </div>

              <div>
                <label className="mb-1 block font-semibold text-slate-400">Default Tax Rate (%)</label>
                <input
                  type="number"
                  required
                  value={settings.defaultTaxRate}
                  onChange={e => setSettings({ ...settings, defaultTaxRate: parseFloat(e.target.value) || 0 })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 font-mono text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block font-semibold text-slate-400">Company Email</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={e => setSettings({ ...settings, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="mb-1 block font-semibold text-slate-400">Tax Registration ID</label>
                <input
                  type="text"
                  value={settings.taxId}
                  onChange={e => setSettings({ ...settings, taxId: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 font-mono text-white"
                />
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                Bank Details (AED B2B Transfer)
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-semibold text-slate-400">Bank Name</label>
                  <input
                    type="text"
                    value={settings.bankName || ''}
                    onChange={e => setSettings({ ...settings, bankName: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-slate-400">Account Number</label>
                  <input
                    type="text"
                    value={settings.accountNumber || ''}
                    onChange={e => setSettings({ ...settings, accountNumber: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 font-mono text-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-slate-400">IBAN</label>
                  <input
                    type="text"
                    value={settings.iban || ''}
                    onChange={e => setSettings({ ...settings, iban: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 font-mono text-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-slate-400">SWIFT Code</label>
                  <input
                    type="text"
                    value={settings.swiftCode || ''}
                    onChange={e => setSettings({ ...settings, swiftCode: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 font-mono text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 border-t border-slate-800 pt-3">
              <span id="admin-save-hint" className="text-xs text-slate-500" />

              <button
                type="submit"
                disabled={isSyncing}
                className="flex items-center space-x-1.5 rounded-xl bg-indigo-600 px-5 py-2 font-bold text-white shadow-md transition-all hover:bg-indigo-500 disabled:opacity-50"
              >
                <Cloud className={`h-4 w-4 ${isSyncing ? 'animate-pulse' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Save & Sync to Cloud'}</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
