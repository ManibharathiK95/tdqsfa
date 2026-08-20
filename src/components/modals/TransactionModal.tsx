import React, { useState, useEffect } from 'react';
import { Transaction, DepartmentId, TransactionType, CompanySettings, VendorContractor } from '../../types';
import { DEPARTMENTS } from '../../data/initialData';
import { X, TrendingDown, TrendingUp } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Partial<Transaction>) => void;
  defaultDeptId?: DepartmentId;
  companySettings: CompanySettings;
  vendors?: VendorContractor[];
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  defaultDeptId = 'design',
  companySettings,
  vendors = [],
}) => {
  const [deptId, setDeptId] = useState<DepartmentId>(defaultDeptId === 'all' ? 'design' : defaultDeptId);
  const [transactionType, setTransactionType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState('');
  const [payeeSource, setPayeeSource] = useState<'vendor' | 'custom'>('custom');
  const [payeeOrPayer, setPayeeOrPayer] = useState('');
  const [referenceNo, setReferenceNo] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const selectedDept = defaultDeptId === 'all' ? 'design' : defaultDeptId;
    setDeptId(selectedDept);
    setTransactionType('expense');
    setCategory('');
    setAmount(0);
    setDate(new Date().toISOString().slice(0, 10));
    setPayeeOrPayer('');
    setPayeeSource('custom');
    setReferenceNo('');
    setNotes('');
  }, [defaultDeptId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category.trim() || amount <= 0 || !payeeOrPayer.trim()) return;

    onSave({
      id: `tx_${Date.now()}`,
      deptId,
      transactionType,
      category,
      amount,
      date,
      payeeOrPayer,
      referenceNo,
      notes,
      status: 'verified',
      createdAt: new Date().toISOString().slice(0, 10),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-[850px] max-w-[95vw] shadow-2xl p-6 relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            {transactionType === 'income' ? (
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            ) : (
              <TrendingDown className="w-5 h-5 text-rose-400" />
            )}
            <span>Record Ledger Transaction</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Transaction Type</label>
              <select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value as TransactionType)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white capitalize font-bold"
              >
                <option value="expense">Expense (-)</option>
                <option value="income">Income (+)</option>
              </select>
            </div>

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
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Category *</label>
            <input
              type="text"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Software License, Subcontractor Detailing Fee, Site Inspection"
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Amount ({companySettings.currencySymbol}) *</label>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className={`w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 font-mono font-bold ${
                  transactionType === 'income' ? 'text-emerald-400' : 'text-rose-400'
                }`}
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>

          {/* Payee/Payer: Vendor dropdown + custom */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Payee / Payer Name *</label>
            <select
              value={payeeSource}
              onChange={(e) => {
                setPayeeSource(e.target.value as 'vendor' | 'custom');
                if (e.target.value === 'custom') setPayeeOrPayer('');
              }}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white mb-2"
            >
              <option value="custom">-- Type Custom Name --</option>
              <option value="vendor">-- Select from Vendors/Contractors --</option>
            </select>
            {payeeSource === 'vendor' ? (
              <select
                value={payeeOrPayer}
                onChange={(e) => setPayeeOrPayer(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white"
              >
                <option value="">Choose vendor...</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.name}>
                    {v.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                required
                value={payeeOrPayer}
                onChange={(e) => setPayeeOrPayer(e.target.value)}
                placeholder="e.g. Tekla CAD Systems Inc"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white"
              />
            )}
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Reference No</label>
            <input
              type="text"
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
              placeholder="e.g. CAD-SUB-991"
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes about this transaction..."
              rows={2}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white resize-none"
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
              Save Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
