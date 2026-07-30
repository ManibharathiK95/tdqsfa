import React, { useState } from 'react';
import { Transaction, DepartmentId, CompanySettings } from '../../types';
import { formatCurrency, downloadCSV } from '../../utils/export';
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  Filter,
  Trash2,
  FileSpreadsheet,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';

interface IncomeExpensesTabProps {
  deptId: DepartmentId;
  transactions: Transaction[];
  companySettings: CompanySettings;
  canEdit: boolean;
  onOpenCreateTransaction: () => void;
  onDeleteTransaction: (txId: string) => void;
}

export const IncomeExpensesTab: React.FC<IncomeExpensesTabProps> = ({
  deptId,
  transactions,
  companySettings,
  canEdit,
  onOpenCreateTransaction,
  onDeleteTransaction,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');

  const filteredTransactions = transactions.filter((tx) => {
    const matchesDept = deptId === 'all' || tx.deptId === deptId;
    const matchesSearch =
      tx.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.payeeOrPayer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.referenceNo && tx.referenceNo.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'all' || tx.transactionType === typeFilter;
    return matchesDept && matchesSearch && matchesType;
  });

  const totalIncome = filteredTransactions
    .filter((tx) => tx.transactionType === 'income')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const totalExpense = filteredTransactions
    .filter((tx) => tx.transactionType === 'expense')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const handleExportCSV = () => {
    const rows = [
      ['Date', 'Dept', 'Type', 'Category', 'Payee/Payer', 'Reference', 'Amount', 'Status'],
      ...filteredTransactions.map((tx) => [
        tx.date,
        tx.deptId,
        tx.transactionType,
        tx.category,
        tx.payeeOrPayer,
        tx.referenceNo || 'N/A',
        tx.amount,
        tx.status,
      ]),
    ];
    downloadCSV(`income_expenses_${deptId}_${new Date().toISOString().slice(0, 10)}`, rows);
  };

  return (
    <div className="space-y-4">
      {/* Income & Expense KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-zinc-300 tracking-wider">Ledger Income</p>
            <p className="text-lg font-black text-emerald-400 mt-0.5">
              {formatCurrency(totalIncome, companySettings)}
            </p>
          </div>
          <div className="p-2 bg-emerald-950 text-emerald-400 border border-emerald-700 rounded-lg">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-zinc-300 tracking-wider">Ledger Expenses</p>
            <p className="text-lg font-black text-rose-400 mt-0.5">
              {formatCurrency(totalExpense, companySettings)}
            </p>
          </div>
          <div className="p-2 bg-rose-950 text-rose-400 border border-rose-800 rounded-lg">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-zinc-300 tracking-wider">Net Balance</p>
            <p className="text-lg font-black text-white mt-0.5">
              {formatCurrency(totalIncome - totalExpense, companySettings)}
            </p>
          </div>
          <div className="p-2 bg-emerald-950 text-emerald-400 border border-emerald-700 rounded-lg">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-950 border border-zinc-800 p-4 rounded-2xl shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-300 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search income/expense by category, payee, or reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <div className="flex items-center space-x-1 bg-zinc-900 border border-zinc-800 p-1 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-zinc-300 ml-1.5" />
            {(['all', 'income', 'expense'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] capitalize transition-all ${
                  typeFilter === t
                    ? 'bg-emerald-700 text-white font-black'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-100 text-xs font-bold rounded-xl transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">Export CSV</span>
          </button>

          {canEdit && (
            <button
              onClick={onOpenCreateTransaction}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md transition-all border border-emerald-500"
            >
              <Plus className="w-4 h-4" />
              <span>Record Transaction</span>
            </button>
          )}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-900 border-b border-zinc-800 text-zinc-300 uppercase tracking-wider font-bold text-[10px]">
                <th className="py-3.5 px-4">Date & Dept</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Payee / Payer</th>
                <th className="py-3.5 px-4">Reference No</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                {canEdit && <th className="py-3.5 px-4 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 7 : 6} className="text-center py-10 text-slate-500">
                    No transactions recorded.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono">
                      <div className="text-slate-200 font-bold">{tx.date}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-sans">
                        {tx.deptId}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">{tx.category}</td>
                    <td className="py-3.5 px-4 text-slate-300">{tx.payeeOrPayer}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {tx.referenceNo || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-sm">
                      <span
                        className={
                          tx.transactionType === 'income' ? 'text-emerald-400' : 'text-rose-400'
                        }
                      >
                        {tx.transactionType === 'income' ? '+' : '-'}
                        {formatCurrency(tx.amount, companySettings)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                        <CheckCircle2 className="w-3 h-3" />
                        <span className="capitalize">{tx.status}</span>
                      </span>
                    </td>
                    {canEdit && (
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="p-1.5 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
                          title="Delete Transaction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
