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
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            {transactionType === 'income' ? <TrendingUp className="w-5 h-5 text-emerald-400" /> : <TrendingDown className="w-5 h-5 text-rose-400" />}
            <span>Record Ledger Transaction</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Transaction Type</label>
              <select value={
