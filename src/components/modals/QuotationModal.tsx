import React, { useState, useEffect } from 'react';
import { Quotation, DepartmentId, LineItem, QuotationStatus, CompanySettings } from '../../types';
import { DEPARTMENTS } from '../../data/initialData';
import { formatCurrency } from '../../utils/export';
import { X, FileText, Plus, Trash2, Calculator } from 'lucide-react';

interface QuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (quotation: Partial<Quotation>) => void;
  initialData?: Quotation | null;
  defaultDeptId?: DepartmentId;
  companySettings: CompanySettings;
}

export const QuotationModal: React.FC<QuotationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  defaultDeptId = 'design',
  companySettings,
}) => {
  const [deptId, setDeptId] = useState<DepartmentId>(defaultDeptId === 'all' ? 'design' : defaultDeptId);
  const [quotationNo, setQuotationNo] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [date, setDate] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [status, setStatus] = useState<QuotationStatus>('draft');
  const [taxRate, setTaxRate] = useState<number>(companySettings.defaultTaxRate || 5);
  const [discount, setDiscount] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');

  const [items, setItems] = useState<LineItem[]>([
    {
      id: 'item_1',
      description: 'Structural / Rebar Detailing Engineering Services',
      quantity: 1,
      unit: 'Lump Sum',
      unitPrice: 5000,
      amount: 5000,
    },
  ]);

  useEffect(() => {
    if (initialData) {
      setDeptId(initialData.deptId);
      setQuotationNo(initialData.quotationNo);
      setClientName(initialData.clientName);
      setClientEmail(initialData.clientEmail);
      setProjectTitle(initialData.projectTitle);
      setDate(initialData.date);
      setValidUntil(initialData.validUntil);
      setStatus(initialData.status);
      setTaxRate(initialData.taxRate);
      setDiscount(initialData.discount);
      setNotes(initialData.notes || '');
      setTerms(initialData.terms || '');
      setItems(initialData.items && initialData.items.length > 0 ? initialData.items : []);
    } else {
      const selectedDept = defaultDeptId === 'all' ? 'design' : defaultDeptId;
      setDeptId(selectedDept);
      setQuotationNo(`EST-${selectedDept.toUpperCase()}-2026-${Math.floor(100 + Math.random() * 900)}`);
      setClientName('');
      setClientEmail('');
      setProjectTitle('');
      setDate(new Date().toISOString().slice(0, 10));

      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 30);
      setValidUntil(expiry.toISOString().slice(0, 10));

      setStatus('draft');
      setTaxRate(companySettings.defaultTaxRate || 5);
      setDiscount(0);
      setNotes('Thank you for requesting an estimate with TDQS Engineering.');
      setTerms('Validity: 30 days from date of estimate. 50% advance upon contract signing.');
      setItems([
        {
          id: `li_${Date.now()}`,
          description: 'Engineering Scope & BOQ Estimation Package',
          quantity: 1,
          unit: 'Package',
          unitPrice: 8500,
          amount: 8500,
        },
      ]);
    }
  }, [initialData, defaultDeptId, isOpen, companySettings]);

  if (!isOpen) return null;

  const handleItemChange = (index: number, field: keyof LineItem, val: any) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: val };
    if (field === 'quantity' || field === 'unitPrice') {
      item.amount = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
    }
    updated[index] = item;
    setItems(updated);
  };

  const addItemRow = () => {
    setItems([
      ...items,
      {
        id: `li_${Date.now()}_${items.length}`,
        description: '',
        quantity: 1,
        unit: 'Units',
        unitPrice: 0,
        amount: 0,
      },
    ]);
  };

  const removeItemRow = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((acc, item) => acc + (item.amount || 0), 0);
  const taxAmount = (subtotal * (taxRate || 0)) / 100;
  const totalAmount = Math.max(0, subtotal + taxAmount - (discount || 0));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle.trim() || !clientName.trim()) return;

    onSave({
      id: initialData ? initialData.id : `q_${Date.now()}`,
      quotationNo,
      deptId,
      clientName,
      clientEmail,
      projectTitle,
      date,
      validUntil,
      status,
      items,
      subtotal,
      taxRate,
      taxAmount,
      discount,
      totalAmount,
      notes,
      terms,
      createdAt: initialData ? initialData.createdAt : new Date().toISOString().slice(0, 10),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl p-6 relative my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <span>{initialData ? 'Edit Quotation / Estimate' : 'Create Quotation / Estimate'}</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
              <label className="block text-slate-400 font-semibold mb-1">Estimate Number</label>
              <input
                type="text"
                required
                value={quotationNo}
                onChange={(e) => setQuotationNo(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as QuotationStatus)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Client / Company Name *</label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Skyline Construction Group"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Client Email</label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="billing@client.com"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Project Title / Scope *</label>
            <input
              type="text"
              required
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              placeholder="e.g. Commercial Tower B Rebar Detailing & BBS"
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Quotation Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Valid Until</label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>

          {/* Line Items Table */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase text-indigo-400 tracking-wider">
                Itemized Scope & Pricing
              </label>
              <button
                type="button"
                onClick={addItemRow}
                className="flex items-center space-x-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-950/40 border border-indigo-800 px-2.5 py-1 rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item Line</span>
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="grid grid-cols-12 gap-2 items-center bg-slate-950 border border-slate-800 p-2.5 rounded-xl"
                >
                  <div className="col-span-5">
                    <input
                      type="text"
                      placeholder="Item description"
                      value={item.description}
                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                    />
                  </div>

                  <div className="col-span-2">
                    <input
                      type="number"
                      placeholder="Qty"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white text-right"
                    />
                  </div>

                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="Unit (e.g. Tons)"
                      value={item.unit}
                      onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-white"
                    />
                  </div>

                  <div className="col-span-2">
                    <input
                      type="number"
                      placeholder="Rate"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-white text-right font-mono"
                    />
                  </div>

                  <div className="col-span-1 text-center">
                    <button
                      type="button"
                      onClick={() => removeItemRow(idx)}
                      className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subtotal & Calculations Box */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Subtotal:</span>
              <span className="font-mono text-white font-bold">{formatCurrency(subtotal, companySettings)}</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-slate-400">Tax Rate (%):</span>
                <input
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  className="w-16 bg-slate-900 border border-slate-800 text-white rounded px-2 py-0.5 text-right font-mono"
                />
              </div>
              <span className="font-mono text-slate-300">+{formatCurrency(taxAmount, companySettings)}</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-slate-400">Discount ({companySettings.currencySymbol}):</span>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="w-20 bg-slate-900 border border-slate-800 text-white rounded px-2 py-0.5 text-right font-mono text-rose-400"
                />
              </div>
              <span className="font-mono text-rose-400">-{formatCurrency(discount, companySettings)}</span>
            </div>

            <div className="flex justify-between items-center text-sm font-bold pt-2 border-t border-slate-800 text-white">
              <span>Total Quotation Amount:</span>
              <span className="text-emerald-400 text-base">{formatCurrency(totalAmount, companySettings)}</span>
            </div>
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
              {initialData ? 'Update Estimate' : 'Save Estimate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
