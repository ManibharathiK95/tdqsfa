import React, { useState } from 'react';
import { Receipt, DepartmentId, CompanySettings } from '../../types';
import { formatCurrency, downloadCSV } from '../../utils/export';
import {
  Receipt as ReceiptIcon,
  Plus,
  Search,
  Filter,
  Trash2,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';

interface ReceiptsTabProps {
  deptId: DepartmentId;
  receipts: Receipt[];
  companySettings: CompanySettings;
  canEdit: boolean;
  onOpenCreateReceipt: () => void;
  onDeleteReceipt: (receiptId: string) => void;
}

export const ReceiptsTab: React.FC<ReceiptsTabProps> = ({
  deptId,
  receipts,
  companySettings,
  canEdit,
  onOpenCreateReceipt,
  onDeleteReceipt,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'incoming' | 'outgoing'>('all');

  const filteredReceipts = receipts.filter((r) => {
    const matchesDept = deptId === 'all' || r.deptId === deptId;
    const matchesSearch =
      r.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.clientOrVendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.referenceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.invoiceNo && r.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'all' || r.type === typeFilter;
    return matchesDept && matchesSearch && matchesType;
  });

  const totalIncoming = filteredReceipts
    .filter((r) => r.type === 'incoming')
    .reduce((acc, r) => acc + r.amount, 0);

  const totalOutgoing = filteredReceipts
    .filter((r) => r.type === 'outgoing')
    .reduce((acc, r) => acc + r.amount, 0);

  const handleExportCSV = () => {
    const rows = [
      ['Receipt No', 'Dept', 'Type', 'Client/Vendor', 'Invoice Ref', 'Payment Date', 'Mode', 'Ref No', 'Amount', 'Status'],
      ...filteredReceipts.map((r) => [
        r.receiptNo,
        r.deptId,
        r.type,
        r.clientOrVendorName,
        r.invoiceNo || 'N/A',
        r.paymentDate,
        r.paymentMode,
        r.referenceNo,
        r.amount,
        r.status,
      ]),
    ];
    downloadCSV(`receipts_${deptId}_${new Date().toISOString().slice(0, 10)}`, rows);
  };

  return (
    <div className="space-y-4">
      {/* Receipts KPI Mini Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-xl">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-semibold text-slate-400">
                Total Incoming Collections
              </p>
              <p className="text-lg font-bold text-emerald-400 mt-0.5">
                {formatCurrency(totalIncoming, companySettings)}
              </p>
            </div>
          </div>
          <span className="text-xs text-slate-400">Client Payments</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-rose-950 text-rose-400 border border-rose-800 rounded-xl">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-semibold text-slate-400">
                Total Outgoing Disbursements
              </p>
              <p className="text-lg font-bold text-rose-400 mt-0.5">
                {formatCurrency(totalOutgoing, companySettings)}
              </p>
            </div>
          </div>
          <span className="text-xs text-slate-400">Vendor / Subcontractor</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search receipts by receipt #, client/vendor, or bank reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 p-1 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            {(['all', 'incoming', 'outgoing'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-2.5 py-1 rounded-lg font-medium text-[11px] capitalize transition-all ${
                  typeFilter === t
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">Export CSV</span>
          </button>

          {canEdit && (
            <button
              onClick={onOpenCreateReceipt}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Record Receipt</span>
            </button>
          )}
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                <th className="py-3.5 px-4">Receipt No & Type</th>
                <th className="py-3.5 px-4">Client / Vendor Name</th>
                <th className="py-3.5 px-4">Invoice / Payment Ref</th>
                <th className="py-3.5 px-4">Date & Payment Mode</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                {canEdit && <th className="py-3.5 px-4 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 7 : 6} className="text-center py-10 text-slate-500">
                    No payment receipts found.
                  </td>
                </tr>
              ) : (
                filteredReceipts.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">
                      <div className="flex items-center space-x-2">
                        <span>{r.receiptNo}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-sans font-bold uppercase ${
                            r.type === 'incoming'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-rose-950 text-rose-400 border border-rose-800'
                          }`}
                        >
                          {r.type}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-sans uppercase">
                        {r.deptId}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">{r.clientOrVendorName}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-slate-200">Ref: {r.referenceNo}</div>
                      {r.invoiceNo && (
                        <div className="text-[10px] text-indigo-400 font-mono">
                          Linked Inv: {r.invoiceNo}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-200">{r.paymentDate}</div>
                      <div className="text-[10px] text-slate-400 capitalize">
                        {r.paymentMode.replace('_', ' ')}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-sm">
                      <span className={r.type === 'incoming' ? 'text-emerald-400' : 'text-rose-400'}>
                        {r.type === 'incoming' ? '+' : '-'}
                        {formatCurrency(r.amount, companySettings)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status === 'cleared'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}
                      >
                        {r.status === 'cleared' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        <span className="capitalize">{r.status}</span>
                      </span>
                    </td>
                    {canEdit && (
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => onDeleteReceipt(r.id)}
                          className="p-1.5 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
                          title="Delete Receipt"
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
