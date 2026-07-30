import React, { useState, useEffect } from 'react';
import { VendorContractor, DepartmentId, VendorType } from '../../types';
import { DEPARTMENTS } from '../../data/initialData';
import { X, Building2, User, Mail, Phone, MapPin, Tag, FileText } from 'lucide-react';

interface VendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vendor: Partial<VendorContractor>) => void;
  initialData?: VendorContractor | null;
  defaultDeptId?: DepartmentId;
}

export const VendorModal: React.FC<VendorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  defaultDeptId = 'design',
}) => {
  const [deptId, setDeptId] = useState<DepartmentId>(defaultDeptId === 'all' ? 'design' : defaultDeptId);
  const [name, setName] = useState('');
  const [type, setType] = useState<VendorType>('contractor');
  const [code, setCode] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [taxId, setTaxId] = useState('');
  const [category, setCategory] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialData) {
      setDeptId(initialData.deptId);
      setName(initialData.name);
      setType(initialData.type);
      setCode(initialData.code);
      setContactPerson(initialData.contactPerson);
      setEmail(initialData.email);
      setPhone(initialData.phone);
      setTaxId(initialData.taxId);
      setCategory(initialData.category);
      setAddress(initialData.address);
      setStatus(initialData.status);
      setNotes(initialData.notes || '');
    } else {
      const selectedDept = defaultDeptId === 'all' ? 'design' : defaultDeptId;
      setDeptId(selectedDept);
      setName('');
      setType('contractor');
      setCode(`VEN-${selectedDept.toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`);
      setContactPerson('');
      setEmail('');
      setPhone('');
      setTaxId('');
      setCategory('');
      setAddress('');
      setStatus('active');
      setNotes('');
    }
  }, [initialData, defaultDeptId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      id: initialData ? initialData.id : `v_${Date.now()}`,
      deptId,
      name,
      type,
      code: code || `VEN-${deptId.toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      contactPerson,
      email,
      phone,
      taxId,
      category: category || 'General Contractor Services',
      address,
      status,
      totalBilled: initialData ? initialData.totalBilled : 0,
      totalPaid: initialData ? initialData.totalPaid : 0,
      balanceDue: initialData ? initialData.balanceDue : 0,
      notes,
      createdAt: initialData ? initialData.createdAt : new Date().toISOString().slice(0, 10),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-indigo-400" />
            <span>{initialData ? 'Edit Contractor / Vendor' : 'Add New Contractor / Vendor'}</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Department</label>
              <select
                value={deptId}
                onChange={(e) => setDeptId(e.target.value as DepartmentId)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Entity Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as VendorType)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white capitalize"
              >
                <option value="contractor">Contractor</option>
                <option value="vendor">Vendor</option>
                <option value="subcontractor">Subcontractor</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-slate-400 font-semibold mb-1">Company / Vendor Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Atlas Steel Rebar Corp"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Vendor Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Contact Person</label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="e.g. John Smith"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Specialty / Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. BBS Drafting, FEA Review"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="billing@vendor.com"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555-0192"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Tax / Registration ID</label>
              <input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                placeholder="TX-991823"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Full business address"
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md"
            >
              {initialData ? 'Update Vendor' : 'Save Vendor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
