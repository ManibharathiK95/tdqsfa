import React, { useState } from 'react';
import { Invoice, DepartmentId, CompanySettings } from '../../types';
import { formatCurrency, downloadCSV } from '../../utils/export';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  FileSpreadsheet,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  DollarSign,
} from 'lucide-react';

interface InvoicesTabProps {
  deptId: DepartmentId;
  invoices: Invoice[];
  companySettings: CompanySettings;
  canEdit: boolean;
  onOpenCreateInvoice: () => void;
  onOpenEditInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (invoiceId: string) => void;
  onViewInvoice: (invoice: Invoice) => void;
  onRecordPayment: (invoice: Invoice) => void;
}

export const InvoicesTab: React.FC<InvoicesTabProps> = ({
  deptId,
  invoices,
  companySettings,
  canEdit,
  onOpenCreateInvoice,
  onOpenEditInvoice,
  onDeleteInvoice,
  onViewInvoice,
  onRecordPayment,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredInvoices = invoices.filter((inv) => {
    const matchesDept = deptId === 'all' || inv.deptId === deptId;
    const matchesSearch =
      inv.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.projectTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesDept && matchesSearch && matchesStatus;
  });

  // Calculate totals
  const totalAmountSum = filteredInvoices.reduce((acc, i) => acc + i.totalAmount, 0);
  const totalPaidSum = filteredInvoices.reduce((acc, i) => acc + (i.paidAmount || 0), 0);
  const totalBalanceDueSum = filteredInvoices.reduce((acc, i) => acc + i.balanceDue, 0);

  const handleExportCSV = () => {
    const rows = [
      ['Invoice No', 'Dept', 'Client', 'Project Title', 'Issue Date', 'Due Date', 'Total Amount', 'Paid Amount', 'Balance Due', 'Status'],
      ...filteredInvoices.map((inv) => [
        inv.invoiceNo,
        inv.deptId,
        inv.clientName,
        inv.projectTitle,
        inv.issueDate,
        inv.dueDate,
        inv.totalAmount,
        inv.paidAmount,
        inv.balanceDue,
        inv.status,
      ]),
    ];
    downloadCSV(`invoices_${deptId}_${new Date().toISOString().slice(0, 10)}`, rows);
  };

  const getStatusBadge = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            <span>Paid in Full</span>
          </span>
        );
      case 'partial':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-950 text-blue-400 border border-blue-800">
            <Clock className="w-3 h-3" />
            <span>Partial Payment</span>
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800">
            <AlertCircle className="w-3 h-3" />
            <span>Overdue</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800">
            <Clock className="w-3 h-3" />
            <span>Pending Payment</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
            <span>Draft</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary KPI Mini Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex justify-between items-center">
          <div>
            <p className="text-[10px] uppercase font-semibold text-slate-400">Total Invoiced</p>
            <p className="text-lg font-bold text-white mt-0.5">
              {formatCurrency(totalAmountSum, companySettings)}
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded">
            {filteredInvoices.length} Invoices
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex justify-between items-center">
          <div>
            <p className="text-[10px] uppercase font-semibold text-slate-400">Total Received</p>
            <p className="text-lg font-bold text-emerald-400 mt-0.5">
              {formatCurrency(totalPaidSum, companySettings)}
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2 py-1 rounded border border-emerald-900">
            Cleared
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex justify-between items-center">
          <div>
            <p className="text-[10px] uppercase font-semibold text-slate-400">Outstanding Balance</p>
            <p className="text-lg font-bold text-amber-400 mt-0.5">
              {formatCurrency(totalBalanceDueSum, companySettings)}
            </p>
          </div>
          <span className="text-xs font-bold text-amber-400 bg-amber-950 px-2 py-1 rounded border border-amber-900">
            Receivables
          </span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search invoices by invoice #, client, or project..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 p-1 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            {(['all', 'pending', 'partial', 'paid', 'overdue'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 rounded-lg font-medium text-[11px] capitalize transition-all ${
                  statusFilter === s
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}
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
              onClick={onOpenCreateInvoice}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Invoice</span>
            </button>
          )}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                <th className="py-3.5 px-4">Invoice No</th>
                <th className="py-3.5 px-4">Client & Project</th>
                <th className="py-3.5 px-4">Issue / Due Date</th>
                <th className="py-3.5 px-4 text-right">Total</th>
                <th className="py-3.5 px-4 text-right">Paid</th>
                <th className="py-3.5 px-4 text-right">Balance Due</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-500">
                    No invoices found.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">
                      {inv.invoiceNo}
                      <div className="text-[10px] text-slate-400 font-sans uppercase">
                        {inv.deptId}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{inv.projectTitle}</div>
                      <div className="text-[11px] text-slate-400">{inv.clientName}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-200">{inv.issueDate}</div>
                      <div className="text-[10px] text-slate-400">Due: {inv.dueDate}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-white">
                      {formatCurrency(inv.totalAmount, companySettings)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-400">
                      {formatCurrency(inv.paidAmount, companySettings)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-amber-400">
                      {formatCurrency(inv.balanceDue, companySettings)}
                    </td>
                    <td className="py-3.5 px-4 text-center">{getStatusBadge(inv.status)}</td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => onViewInvoice(inv)}
                          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
                          title="View / Print Official Invoice"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {canEdit && inv.balanceDue > 0 && (
                          <button
                            onClick={() => onRecordPayment(inv)}
                            className="flex items-center space-x-1 px-2 py-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 rounded-lg text-[10px] font-bold transition-all shadow-sm"
                            title="Record Payment Receipt"
                          >
                            <DollarSign className="w-3 h-3 text-emerald-400" />
                            <span>Pay</span>
                          </button>
                        )}

                        {canEdit && (
                          <>
                            <button
                              onClick={() => onOpenEditInvoice(inv)}
                              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
                              title="Edit Invoice"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteInvoice(inv.id)}
                              className="p-1.5 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
                              title="Delete Invoice"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
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
