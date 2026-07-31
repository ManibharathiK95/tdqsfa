import React, { useState, useEffect } from 'react';
import { Receipt, DepartmentId, PaymentMode, ReceiptType, CompanySettings, Invoice, VendorContractor } from '../../types';
import { DEPARTMENTS } from '../../data/initialData';
import { X, Receipt as ReceiptIcon } from 'lucide-react';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (receipt: Partial<Receipt>) => void;
  defaultDeptId?: DepartmentId;
  initialInvoice?: Invoice | null;
  companySettings: CompanySettings;
  vendors?: VendorContractor[];
  suggestedNo?: string;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  onSave,
  defaultDeptId = 'design',
  initialInvoice,
  companySettings,
  vendors = [],
  suggestedNo = '',
}) => {
  const [deptId, setDeptId] = useState<DepartmentId>(defaultDeptId === 'all' ? 'design' : defaultDeptId);
  const [receiptNo, setReceiptNo] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [nameSource, setNameSource] = useState<'vendor' | 'custom'>('custom');
  const [clientOrVendorName, setClientOrVendorName] = useState('');
  const [type, setType] = useState<ReceiptType>('incoming');
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('bank_transfer');
  const [referenceNo, setReferenceNo] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [status, setStatus] = useState<'cleared' | 'pending'>('cleared');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialInvoice) {
      setDeptId(initialInvoice.deptId);
      setInvoiceNo(initialInvoice.invoiceNo);
      setClientOrVendorName(initialInvoice.clientName);
      setNameSource(vendors.find((v) => v.name === initialInvoice.clientName) ? 'vendor' : 'custom');
      setType('incoming');
      setAmount(initialInvoice.balanceDue > 0 ? initialInvoice.balanceDue : initialInvoice.totalAmount);
      setReferenceNo(`TXN-${Math.floor(1000000 + Math.random() * 9000000)}`);
      setReceiptNo(suggestedNo || '');
      setPaymentDate(new Date().toISOString().slice(0, 10));
    } else {
      const selectedDept = defaultDeptId === 'all' ? 'design' : defaultDeptId;
      setDeptId(selectedDept);
      setInvoiceNo('');
      setClientOrVendorName('');
      setNameSource('custom');
      setType('incoming');
      setAmount(0);
      setReferenceNo(`TXN-${Math.floor(1000000 + Math.random() * 9000000)}`);
      setReceiptNo(suggestedNo || '');
      setPaymentDate(new Date().toISOString().slice(0, 10));
    }
  }, [initialInvoice, defaultDeptId, isOpen, suggestedNo, vendors]);

  if (!isOpen) return null;

  const handleVendorSelect = (vendorName: string) => {
    setClientOrVendorName(vendorName);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientOrVendorName.trim() || amount <= 0) return;

    onSave({
      id: `rec_${Date.now()}`,
      receiptNo,
      deptId,
      invoiceNo,
      clientOrVendorName,
      type,
      paymentDate,
      paymentMode,
      referenceNo,
      amount,
      status,
      notes,
      createdAt: new Date().toISOString().slice(0, 10),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <ReceiptIcon className="w-5 h-5 text-emerald-400" />
            <span>Record Payment Receipt</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Department</label>
              <select value={deptId} onChange={(e) => setDeptId(e.target.value as DepartmentId)} className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white">
                {DEPARTMENTS.map((d) => (<option key={d.id} value={d.id}>{d.name}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Payment Type</label>
              <select value={type} onChange={(e) => setType(e.target.value as ReceiptType)} className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white capitalize">
                <option value="incoming">Incoming (Client Payment)</option>
                <option value="outgoing">Outgoing (Vendor Payout)</option>
              </select>
            </div>
          </div>

          {/* Client/Vendor: dropdown + custom */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Client / Vendor Name *</label>
            <select value={nameSource} onChange={(e) => { setNameSource(e.target.value as 'vendor' | 'custom'); if (e.target.value === 'custom') setClientOrVendorName(''); }} className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white mb-2">
              <option value="custom">-- Type Custom Name --</option>
              <option value="vendor">-- Select from Vendors/Contractors --</option>
            </select>
            {nameSource === 'vendor' ? (
              <select value={clientOrVendorName} onChange={(e) => handleVendorSelect(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white">
                <option value="">Choose vendor...</option>
                {vendors.map((v) => (<option key={v.id} value={v.name}>{v.name}</option>))}
              </select>
            ) : (
              <input type="text" required value={clientOrVendorName} onChange={(e) => setClientOrVendorName(e.target.value)} placeholder="e.g. Metro Transit Corp" className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white" />
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Receipt Number</label>
              <input type="text" required value={receiptNo} onChange={(e) => setReceiptNo(e.target.value)} className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white font-mono" />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Linked Invoice Ref</label>
              <input type="text" value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} placeholder="Optional" className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white font-mono" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Payment Amount ({companySettings.currencySymbol}) *</label>
              <input type="number" required min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(parseFloat(e.target.value) || 0)} className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white font-mono font-bold text-emerald-400" />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Payment Mode</label>
              <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value as PaymentMode)} className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white capitalize">
                <option value="bank_transfer">Bank Wire Transfer</option>
                <option value="cheque">Cheque</option>
                <option value="cash">Cash</option>
                <option value="online">Online Payment</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Bank / Transaction Ref</label>
              <input type="text" value={referenceNo} onChange={(e) => setReferenceNo(e.target.value)} placeholder="e.g. TXN-99182" className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white font-mono" />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Payment Date</label>
              <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white" />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md">Save Receipt</button>
          </div>
        </form>
      </div>
    </div>
  );
};
