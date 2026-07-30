import React, { useState } from 'react';
import { Quotation, DepartmentId, CompanySettings } from '../../types';
import { formatCurrency, downloadCSV } from '../../utils/export';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  FileSpreadsheet,
  ArrowRightLeft,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Send,
} from 'lucide-react';

interface QuotationsTabProps {
  deptId: DepartmentId;
  quotations: Quotation[];
  companySettings: CompanySettings;
  canEdit: boolean;
  onOpenCreateQuotation: () => void;
  onOpenEditQuotation: (quotation: Quotation) => void;
  onDeleteQuotation: (quotationId: string) => void;
  onConvertToInvoice: (quotation: Quotation) => void;
  onViewQuotation: (quotation: Quotation) => void;
}

export const QuotationsTab: React.FC<QuotationsTabProps> = ({
  deptId,
  quotations,
  companySettings,
  canEdit,
  onOpenCreateQuotation,
  onOpenEditQuotation,
  onDeleteQuotation,
  onConvertToInvoice,
  onViewQuotation,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredQuotations = quotations.filter((q) => {
    const matchesDept = deptId === 'all' || q.deptId === deptId;
    const matchesSearch =
      q.quotationNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.projectTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
    return matchesDept && matchesSearch && matchesStatus;
  });

  const handleExportCSV = () => {
    const rows = [
      ['Quotation No', 'Dept', 'Client', 'Project Title', 'Date', 'Valid Until', 'Subtotal', 'Tax', 'Discount', 'Total Amount', 'Status'],
      ...filteredQuotations.map((q) => [
        q.quotationNo,
        q.deptId,
        q.clientName,
        q.projectTitle,
        q.date,
        q.validUntil,
        q.subtotal,
        q.taxAmount,
        q.discount,
        q.totalAmount,
        q.status,
      ]),
    ];
    downloadCSV(`quotations_${deptId}_${new Date().toISOString().slice(0, 10)}`, rows);
  };

  const getStatusBadge = (status: Quotation['status']) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
            <CheckCircle className="w-3 h-3" />
            <span>Approved</span>
          </span>
        );
      case 'sent':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-950 text-blue-400 border border-blue-800">
            <Send className="w-3 h-3" />
            <span>Sent to Client</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800">
            <XCircle className="w-3 h-3" />
            <span>Rejected</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>Draft</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Action Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search quotations by estimate #, client, or project..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 p-1 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            {(['all', 'draft', 'sent', 'approved', 'rejected'] as const).map((s) => (
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
              onClick={onOpenCreateQuotation}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Quotation</span>
            </button>
          )}
        </div>
      </div>

      {/* Quotations Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                <th className="py-3.5 px-4">Estimate No</th>
                <th className="py-3.5 px-4">Client & Project</th>
                <th className="py-3.5 px-4">Date / Expiry</th>
                <th className="py-3.5 px-4 text-right">Items</th>
                <th className="py-3.5 px-4 text-right">Total Amount</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredQuotations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500">
                    No quotations found.
                  </td>
                </tr>
              ) : (
                filteredQuotations.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">
                      {q.quotationNo}
                      <div className="text-[10px] text-slate-400 font-sans uppercase">
                        {q.deptId}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{q.projectTitle}</div>
                      <div className="text-[11px] text-slate-400">{q.clientName}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-200">{q.date}</div>
                      <div className="text-[10px] text-slate-400">Valid to: {q.validUntil}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-400">
                      {q.items.length} line items
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-white text-sm">
                      {formatCurrency(q.totalAmount, companySettings)}
                    </td>
                    <td className="py-3.5 px-4 text-center">{getStatusBadge(q.status)}</td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => onViewQuotation(q)}
                          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
                          title="View / Print Quotation"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {canEdit && q.status === 'approved' && (
                          <button
                            onClick={() => onConvertToInvoice(q)}
                            className="flex items-center space-x-1 px-2 py-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 rounded-lg text-[10px] font-bold transition-all shadow-sm"
                            title="Convert to Official Invoice"
                          >
                            <ArrowRightLeft className="w-3 h-3" />
                            <span>Invoice</span>
                          </button>
                        )}

                        {canEdit && (
                          <>
                            <button
                              onClick={() => onOpenEditQuotation(q)}
                              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
                              title="Edit Quotation"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteQuotation(q.id)}
                              className="p-1.5 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
                              title="Delete Quotation"
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
