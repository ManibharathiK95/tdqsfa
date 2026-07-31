import React, { useState } from 'react';
import { User, CompanySettings, DepartmentId } from '../../types';
import { DEPARTMENTS } from '../../data/initialData';
import { X, ShieldCheck, KeyRound, UserPlus, Trash2, Building2, Save } from 'lucide-react';

interface AdminSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onSaveUsers: (users: User[]) => void;
  companySettings: CompanySettings;
  onSaveCompanySettings: (settings: CompanySettings) => void;
}

export const AdminSettingsModal: React.FC<AdminSettingsModalProps> = ({
  isOpen,
  onClose,
  users,
  onSaveUsers,
  companySettings,
  onSaveCompanySettings,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'company'>('users');
  const [userList, setUserList] = useState<User[]>(users);
  const [settings, setSettings] = useState<CompanySettings>(companySettings);

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
      email: `${newName.toLowerCase().replace(/\s+/g, '')}@thulirqs.com`,
      avatarColor:
        newDeptId === 'design'
          ? 'bg-blue-600'
          : newDeptId === 'rebar'
          ? 'bg-amber-600'
          : newDeptId === 'qs'
          ? 'bg-emerald-600'
          : 'bg-purple-600',
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

  const handleSaveAllUsers = () => {
    onSaveUsers(userList);
  };

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveCompanySettings(settings);
    alert('Company & Financial Settings updated successfully!');
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
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'users'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Manage Users & 4-Digit PINs</span>
          </button>
          <button
            onClick={() => setActiveTab('company')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'company'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Company Profile & Currency</span>
          </button>
        </div>

        {activeTab === 'users' && (
          <div className="space-y-6 text-xs">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold uppercase text-slate-300">Current Users & Security PINs</label>
                <button onClick={handleSaveAllUsers} className="flex items-center space-x-1 text-xs font-bold text-emerald-400 hover:underline">
                  <Save className="w-3.5 h-3.5" />
                  <span>Save PIN Updates</span>
                </button>
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
                        <p className="text-[10px] text-slate-400 capitalize">
                          {u.role === 'admin' ? 'Admin' : `${u.departmentId} Staff`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg">
                        <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="text-[10px] text-slate-400">PIN:</span>
                        <input
                          type="text"
                          maxLength={4}
                          value={u.pin}
                          onChange={(e) => handleUpdatePin(u.id, e.target.value)}
                          className="w-12 bg-slate-950 border border-slate-700 font-mono font-bold text-center text-white rounded px-1 text-xs focus:border-indigo-500"
                        />
                      </div>
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-1.5 hover:bg-rose-950 text-slate-500 hover:text-rose-400 rounded-lg transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleAddUser} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
              <label className="block text-xs font-bold uppercase text-indigo-400 tracking-wider flex items-center space-x-1">
                <UserPlus className="w-4 h-4" />
                <span>Create New User Account</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Full Name *</label>
                  <input type="text" required value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Alex Engineer" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Set 4-Digit PIN *</label>
                  <input type="text" required maxLength={4} value={newPin} onChange={(e) => setNewPin(e.target.value)} placeholder="e.g. 5555" className="w-full bg-slate-900 border border-slate-800 font-mono font-bold text-center text-white rounded-xl px-3 py-1.5" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Assigned Department</label>
                  <select value={newDeptId} onChange={(e) => setNewDeptId(e.target.value as DepartmentId)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white">
                    {DEPARTMENTS.map((d) => (<option key={d.id} value={d.id}>{d.name}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">System Role</label>
                  <select value={newRole} onChange={(e) => setNewRole(e.target.value as 'admin' | 'staff')} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white">
                    <option value="staff">Department Staff</option>
                    <option value="admin">System Admin</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow transition-all">
                Create User & Assign PIN
              </button>
            </form>
          </div>
        )}

        {activeTab === 'company' && (
          <form onSubmit={handleSaveCompany} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Company Name</label>
              <input type="text" required value={settings.companyName} onChange={(e) => setSettings({ ...settings, companyName: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Currency Symbol</label>
                <input type="text" required value={settings.currencySymbol} onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })} placeholder="e.g. AED" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono" />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Default Tax Rate (%)</label>
                <input type="number" required value={settings.defaultTaxRate} onChange={(e) => setSettings({ ...settings, defaultTaxRate: parseFloat(e.target.value) || 0 })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Company Email</label>
                <input type="email" value={settings.email} onChange={(e) => setSettings({ ...settings, email: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Tax Registration ID</label>
                <input type="text" value={settings.taxId} onChange={(e) => setSettings({ ...settings, taxId: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono" />
              </div>
            </div>

            {/* Bank Details for AED B2B Transactions */}
            <div className="pt-4 border-t border-slate-800">
              <p className="text-[11px] font-bold uppercase text-emerald-400 tracking-wider mb-3">Bank Details (AED B2B Transfer — prints on invoices)</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Bank Name</label>
                  <input type="text" value={settings.bankName || ''} onChange={(e) => setSettings({ ...settings, bankName: e.target.value })} placeholder="e.g. Emirates NBD" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Account Number</label>
                  <input type="text" value={settings.accountNumber || ''} onChange={(e) => setSettings({ ...settings, accountNumber: e.target.value })} placeholder="e.g. 0345678901" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">IBAN</label>
                  <input type="text" value={settings.iban || ''} onChange={(e) => setSettings({ ...settings, iban: e.target.value })} placeholder="e.g. AE07 0331 2345 6789 0123 456" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">SWIFT Code</label>
                  <input type="text" value={settings.swiftCode || ''} onChange={(e) => setSettings({ ...settings, swiftCode: e.target.value })} placeholder="e.g. EBILAEAD" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md">
                Save Settings
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
