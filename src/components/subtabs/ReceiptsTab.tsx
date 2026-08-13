import React, { useState } from 'react';
import {
  Receipt,
  DepartmentId,
  CompanySettings,
  Invoice,
} from '../../types';
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
  Eye,
} from 'lucide-react';

interface ReceiptsTabProps {
  deptId: DepartmentId;
  receipts: Receipt[];
  invoices: Invoice[];
  companySettings: CompanySettings;
  canEdit: boolean;
  onOpenCreateReceipt: () => void;
  onDeleteReceipt: (receiptId: string) => void;
  onViewReceipt: (receipt: Receipt) => void;
}

export const ReceiptsTab: React.FC<ReceiptsTabProps> = ({
  deptId,
  receipts,
  invoices,
  companySettings,
  canEdit,
  onOpenCreateReceipt,
  onDeleteReceipt,
  onViewReceipt,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<
    'all' | 'incoming' | 'outgoing'
  >('all');

  const filteredReceipts = receipts.filter((r) => {
    const search = searchTerm.toLowerCase();

    const matchesDept =
      deptId === 'all' || r.deptId === deptId;

    const matchesSearch =
      r.receiptNo?.toLowerCase().includes(search) ||
      r.clientOrVendorName?.toLowerCase().includes(search) ||
      r.referenceNo?.toLowerCase().includes(search) ||
      r.invoiceNo?.toLowerCase().includes(search);

    const matchesType =
      typeFilter === 'all' || r.type === typeFilter;

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
      [
        'Receipt No',
        'Dept',
        'Type',
        'Client/Vendor',
        'Invoice Ref',
        'Payment Date',
        'Mode',
        'Ref No',
        'Amount',
        'Status',
      ],
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

    downloadCSV(
      `receipts_${deptId}_${new Date()
        .toISOString()
        .slice(0, 10)}`,
      rows
    );
  };

  return (
    <div className="space-y-4">
      {/* KPI SUMMARY */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 p-3.5">
          <div className="flex items-center space-x-3">
            <div className="rounded-xl border border-emerald-800 bg-emerald-950 p-2.5 text-emerald-400">
              <ArrowDownLeft className="h-5 w-5" />
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase text-slate-400">
                Total Incoming Collections
              </p>

              <p className="mt-0.5 text-lg font-bold text-emerald-400">
                {formatCurrency(
                  totalIncoming,
                  companySettings
                )}
              </p>
            </div>
          </div>

          <span className="text-xs text-slate-400">
            Client Payments
          </span>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 p-3.5">
          <div className="flex items-center space-x-3">
            <div className="rounded-xl border border-rose-800 bg-rose-950 p-2.5 text-rose-400">
              <ArrowUpRight className="h-5 w-5" />
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase text-slate-400">
                Total Outgoing Disbursements
              </p>

              <p className="mt-0.5 text-lg font-bold text-rose-400">
                {formatCurrency(
                  totalOutgoing,
                  companySettings
                )}
              </p>
            </div>
          </div>

          <span className="text-xs text-slate-400">
            Vendor / Subcontractor
          </span>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col items-stretch justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            placeholder="Search receipts by receipt #, client/vendor, or bank reference..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex shrink-0 items-center space-x-2">
          {/* FILTER */}
          <div className="flex items-center space-x-1 rounded-xl border border-slate-800 bg-slate-950 p-1 text-xs">
            <Filter className="ml-1.5 h-3.5 w-3.5 text-slate-400" />

            {(['all', 'incoming', 'outgoing'] as const).map(
              (t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() =>
                    setTypeFilter(t)
                  }
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-medium capitalize transition-all ${
                    typeFilter === t
                      ? 'bg-indigo-600 font-bold text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              )
            )}
          </div>

          {/* EXPORT */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 transition-all hover:bg-slate-700"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-400" />

            <span className="hidden md:inline">
              Export CSV
            </span>
          </button>

          {/* CREATE */}
          {canEdit && (
            <button
              type="button"
              onClick={onOpenCreateReceipt}
              className="flex items-center space-x-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-md transition-all hover:bg-indigo-500"
            >
              <Plus className="h-4 w-4" />

              <span>Record Receipt</span>
            </button>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-4 py-3.5">
                  Receipt No & Type
                </th>

                <th className="px-4 py-3.5">
                  Client / Vendor Name
                </th>

                <th className="px-4 py-3.5">
                  Invoice / Payment Ref
                </th>

                <th className="px-4 py-3.5">
                  Date & Payment Mode
                </th>

                <th className="px-4 py-3.5 text-right">
                  Amount
                </th>

                <th className="px-4 py-3.5 text-center">
                  Status
                </th>

                <th className="px-4 py-3.5 text-center">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredReceipts.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-10 text-center text-slate-500"
                  >
                    No payment receipts found.
                  </td>
                </tr>
              ) : (
                filteredReceipts.map((r) => (
                  <tr
                    key={r.id}
                    className="transition-colors hover:bg-slate-800/40"
                  >
                    {/* RECEIPT */}
                    <td className="px-4 py-3.5 font-mono font-bold text-indigo-400">
                      <div className="flex items-center space-x-2">
                        <span>{r.receiptNo}</span>

                        <span
                          className={`rounded px-1.5 py-0.5 text-[9px] font-sans font-bold uppercase ${
                            r.type === 'incoming'
                              ? 'border border-emerald-800 bg-emerald-950 text-emerald-400'
                              : 'border border-rose-800 bg-rose-950 text-rose-400'
                          }`}
                        >
                          {r.type}
                        </span>
                      </div>

                      <div className="font-sans text-[10px] uppercase text-slate-400">
                        {r.deptId}
                      </div>
                    </td>

                    {/* CLIENT */}
                    <td className="px-4 py-3.5 font-bold text-white">
                      {r.clientOrVendorName}
                    </td>

                    {/* REFERENCE */}
                    <td className="px-4 py-3.5">
                      <div className="font-mono text-slate-200">
                        Ref: {r.referenceNo}
                      </div>

                      {r.invoiceNo && (
                        <div className="font-mono text-[10px] text-indigo-400">
                          Linked Inv: {r.invoiceNo}
                        </div>
                      )}
                    </td>

                    {/* DATE */}
                    <td className="px-4 py-3.5">
                      <div className="text-slate-200">
                        {r.paymentDate}
                      </div>

                      <div className="text-[10px] capitalize text-slate-400">
                        {r.paymentMode.replace(
                          '_',
                          ' '
                        )}
                      </div>
                    </td>

                    {/* AMOUNT */}
                    <td className="px-4 py-3.5 text-right text-sm font-bold">
                      <span
                        className={
                          r.type === 'incoming'
                            ? 'text-emerald-400'
                            : 'text-rose-400'
                        }
                      >
                        {r.type === 'incoming'
                          ? '+'
                          : '-'}
                        {formatCurrency(
                          r.amount,
                          companySettings
                        )}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center space-x-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          r.status === 'cleared'
                            ? 'border border-emerald-800 bg-emerald-950 text-emerald-400'
                            : 'border border-amber-800 bg-amber-950 text-amber-400'
                        }`}
                      >
                        {r.status === 'cleared' ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <Clock className="h-3 w-3" />
                        )}

                        <span className="capitalize">
                          {r.status}
                        </span>
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        {/* VIEW */}
                        <button
                          type="button"
                          onClick={() =>
                            onViewReceipt(r)
                          }
                          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-indigo-950 hover:text-indigo-400"
                          title="View Receipt"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>

                        {/* DELETE */}
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() =>
                              onDeleteReceipt(r.id)
                            }
                            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-950 hover:text-rose-400"
                            title="Delete Receipt"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
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

export default ReceiptsTab;
