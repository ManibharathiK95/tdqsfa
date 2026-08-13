import React, { useState } from 'react';
import {
  DepartmentId,
  CompanySettings,
  Receipt,
} from '../../types';
import {
  formatCurrency,
  downloadCSV,
} from '../../utils/export';

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
  companySettings: CompanySettings;
  canEdit: boolean;

  onOpenCreateReceipt: () => void;
  onDeleteReceipt: (receiptId: string) => void;
  onViewReceipt: (receipt: Receipt) => void;
}

export const ReceiptsTab: React.FC<ReceiptsTabProps> = ({
  deptId,
  receipts,
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

  /*
   * Filter receipts
   */
  const filteredReceipts = receipts.filter((receipt) => {
    const search = searchTerm.toLowerCase().trim();

    const matchesDept =
      deptId === 'all' || receipt.deptId === deptId;

    const matchesSearch =
      !search ||
      receipt.receiptNo
        ?.toLowerCase()
        .includes(search) ||
      receipt.clientOrVendorName
        ?.toLowerCase()
        .includes(search) ||
      receipt.referenceNo
        ?.toLowerCase()
        .includes(search) ||
      receipt.invoiceNo
        ?.toLowerCase()
        .includes(search);

    const matchesType =
      typeFilter === 'all' ||
      receipt.type === typeFilter;

    return (
      matchesDept &&
      matchesSearch &&
      matchesType
    );
  });

  /*
   * Totals
   */
  const totalIncoming = filteredReceipts
    .filter((receipt) => receipt.type === 'incoming')
    .reduce(
      (total, receipt) => total + Number(receipt.amount || 0),
      0
    );

  const totalOutgoing = filteredReceipts
    .filter((receipt) => receipt.type === 'outgoing')
    .reduce(
      (total, receipt) => total + Number(receipt.amount || 0),
      0
    );

  /*
   * Export CSV
   */
  const handleExportCSV = () => {
    const rows = [
      [
        'Receipt No',
        'Department',
        'Type',
        'Client / Vendor',
        'Invoice Ref',
        'Payment Date',
        'Payment Mode',
        'Reference No',
        'Amount',
        'Status',
        'Notes',
      ],

      ...filteredReceipts.map((receipt) => [
        receipt.receiptNo || '',
        receipt.deptId || '',
        receipt.type || '',
        receipt.clientOrVendorName || '',
        receipt.invoiceNo || '',
        receipt.paymentDate || '',
        receipt.paymentMode || '',
        receipt.referenceNo || '',
        receipt.amount ?? 0,
        receipt.status || '',
        receipt.notes || '',
      ]),
    ];

    downloadCSV(
      `receipts_${deptId}_${new Date()
        .toISOString()
        .slice(0, 10)}`,
      rows
    );
  };

  /*
   * Delete confirmation
   */
  const handleDelete = (receipt: Receipt) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete receipt "${receipt.receiptNo}"?`
    );

    if (!confirmed) {
      return;
    }

    onDeleteReceipt(receipt.id);
  };

  /*
   * Payment mode display
   */
  const getPaymentModeLabel = (
    paymentMode: string
  ) => {
    switch (paymentMode) {
      case 'bank_transfer':
        return 'Bank Wire Transfer';

      case 'cheque':
        return 'Cheque';

      case 'cash':
        return 'Cash';

      case 'online':
        return 'Online Payment';

      default:
        return paymentMode
          ?.replace(/_/g, ' ')
          .replace(/\b\w/g, (char) =>
            char.toUpperCase()
          );
    }
  };

  return (
    <div className="space-y-4">

      {/* =========================================================
          KPI SUMMARY
      ========================================================= */}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

        {/* Incoming */}
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

        {/* Outgoing */}
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

      {/* =========================================================
          TOOLBAR
      ========================================================= */}

      <div className="flex flex-col items-stretch justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-sm sm:flex-row sm:items-center">

        {/* Search */}
        <div className="relative flex-1">

          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            placeholder="Search receipts by receipt #, client/vendor, invoice or bank reference..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />

        </div>

        {/* Controls */}
        <div className="flex shrink-0 items-center space-x-2">

          {/* Type Filter */}
          <div className="flex items-center space-x-1 rounded-xl border border-slate-800 bg-slate-950 p-1 text-xs">

            <Filter className="ml-1.5 h-3.5 w-3.5 text-slate-400" />

            {(
              [
                'all',
                'incoming',
                'outgoing',
              ] as const
            ).map((type) => (

              <button
                key={type}
                type="button"
                onClick={() =>
                  setTypeFilter(type)
                }
                className={`rounded-lg px-2.5 py-1 text-[11px] font-medium capitalize transition-all ${
                  typeFilter === type
                    ? 'bg-indigo-600 font-bold text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {type}
              </button>

            ))}

          </div>

          {/* Export */}
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

          {/* Create */}
          {canEdit && (
            <button
              type="button"
              onClick={onOpenCreateReceipt}
              className="flex items-center space-x-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-md transition-all hover:bg-indigo-500"
            >
              <Plus className="h-4 w-4" />

              <span>
                Record Receipt
              </span>
            </button>
          )}

        </div>

      </div>

      {/* =========================================================
          TABLE
      ========================================================= */}

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full border-collapse text-left text-xs">

            {/* Header */}
            <thead>

              <tr className="border-b border-slate-800 bg-slate-950/80 text-[10px] font-semibold uppercase tracking-wider text-slate-400">

                <th className="whitespace-nowrap px-4 py-3.5">
                  Receipt No & Type
                </th>

                <th className="whitespace-nowrap px-4 py-3.5">
                  Client / Vendor Name
                </th>

                <th className="whitespace-nowrap px-4 py-3.5">
                  Invoice / Payment Ref
                </th>

                <th className="whitespace-nowrap px-4 py-3.5">
                  Date & Payment Mode
                </th>

                <th className="whitespace-nowrap px-4 py-3.5 text-right">
                  Amount
                </th>

                <th className="whitespace-nowrap px-4 py-3.5 text-center">
                  Status
                </th>

                <th className="whitespace-nowrap px-4 py-3.5 text-center">
                  Actions
                </th>

              </tr>

            </thead>

            {/* Body */}
            <tbody className="divide-y divide-slate-800/60 text-slate-300">

              {filteredReceipts.length === 0 ? (

                <tr>

                  <td
                    colSpan={7}
                    className="py-12 text-center text-slate-500"
                  >

                    <div className="flex flex-col items-center justify-center">

                      <ReceiptIcon className="mb-3 h-10 w-10 text-slate-700" />

                      <p className="font-semibold">
                        No payment receipts found.
                      </p>

                      {searchTerm && (
                        <p className="mt-1 text-[11px] text-slate-600">
                          Try changing your search or filter.
                        </p>
                      )}

                    </div>

                  </td>

                </tr>

              ) : (

                filteredReceipts.map((receipt) => (

                  <tr
                    key={receipt.id}
                    className="transition-colors hover:bg-slate-800/40"
                  >

                    {/* Receipt Number */}
                    <td className="px-4 py-3.5 font-mono font-bold text-indigo-400">

                      <div className="flex items-center space-x-2">

                        <span>
                          {receipt.receiptNo}
                        </span>

                        <span
                          className={`rounded border px-1.5 py-0.5 font-sans text-[9px] font-bold uppercase ${
                            receipt.type ===
                            'incoming'
                              ? 'border-emerald-800 bg-emerald-950 text-emerald-400'
                              : 'border-rose-800 bg-rose-950 text-rose-400'
                          }`}
                        >
                          {receipt.type}
                        </span>

                      </div>

                      <div className="font-sans text-[10px] uppercase text-slate-400">
                        {receipt.deptId}
                      </div>

                    </td>

                    {/* Client / Vendor */}
                    <td className="px-4 py-3.5">

                      <div className="font-bold text-white">
                        {receipt.clientOrVendorName}
                      </div>

                    </td>

                    {/* Invoice / Reference */}
                    <td className="px-4 py-3.5">

                      <div className="font-mono text-slate-200">
                        Ref:{' '}
                        {receipt.referenceNo ||
                          'N/A'}
                      </div>

                      {receipt.invoiceNo && (
                        <div className="mt-0.5 font-mono text-[10px] text-indigo-400">
                          Linked Inv:{' '}
                          {receipt.invoiceNo}
                        </div>
                      )}

                    </td>

                    {/* Date / Mode */}
                    <td className="px-4 py-3.5">

                      <div className="text-slate-200">
                        {receipt.paymentDate ||
                          'N/A'}
                      </div>

                      <div className="mt-0.5 text-[10px] text-slate-400">
                        {getPaymentModeLabel(
                          receipt.paymentMode
                        )}
                      </div>

                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3.5 text-right font-bold text-sm">

                      <span
                        className={
                          receipt.type ===
                          'incoming'
                            ? 'text-emerald-400'
                            : 'text-rose-400'
                        }
                      >
                        {receipt.type ===
                        'incoming'
                          ? '+'
                          : '-'}

                        {formatCurrency(
                          Number(
                            receipt.amount || 0
                          ),
                          companySettings
                        )}
                      </span>

                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5 text-center">

                      <span
                        className={`inline-flex items-center space-x-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
                          receipt.status ===
                          'cleared'
                            ? 'border-emerald-800 bg-emerald-950 text-emerald-400'
                            : 'border-amber-800 bg-amber-950 text-amber-400'
                        }`}
                      >

                        {receipt.status ===
                        'cleared' ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <Clock className="h-3 w-3" />
                        )}

                        <span className="capitalize">
                          {receipt.status}
                        </span>

                      </span>

                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-center">

                      <div className="flex items-center justify-center gap-1.5">

                        {/* View */}
                        <button
                          type="button"
                          onClick={() =>
                            onViewReceipt(
                              receipt
                            )
                          }
                          className="flex items-center gap-1 rounded-lg border border-indigo-800 bg-indigo-950 px-2.5 py-1.5 text-[11px] font-semibold text-indigo-400 transition-colors hover:bg-indigo-900 hover:text-indigo-300"
                          title="View Receipt"
                        >
                          <Eye className="h-3.5 w-3.5" />

                          <span>
                            View
                          </span>
                        </button>

                        {/* Delete */}
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                receipt
                              )
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

      {/* Result Count */}
      <div className="flex justify-between px-1 text-[10px] text-slate-500">

        <span>
          Showing {filteredReceipts.length} of{' '}
          {receipts.filter(
            (receipt) =>
              deptId === 'all' ||
              receipt.deptId === deptId
          ).length}{' '}
          receipts
        </span>

        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="text-indigo-400 hover:text-indigo-300"
          >
            Clear search
          </button>
        )}

      </div>

    </div>
  );
};

export default ReceiptsTab;
