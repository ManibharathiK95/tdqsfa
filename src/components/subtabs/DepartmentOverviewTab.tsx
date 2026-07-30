import React from 'react';
import {
  DepartmentId,
  Invoice,
  Quotation,
  Receipt,
  Transaction,
  VendorContractor,
  CompanySettings,
} from '../../types';
import { DEPARTMENTS } from '../../data/initialData';
import { formatCurrency } from '../../utils/export';
import {
  TrendingUp,
  TrendingDown,
  FileText,
  Users,
  DollarSign,
  AlertCircle,
  ArrowRight,
  Compass,
  Layers,
  Calculator,
  Building2,
  CheckCircle2,
} from 'lucide-react';

interface DepartmentOverviewTabProps {
  deptId: DepartmentId;
  companySettings: CompanySettings;
  invoices: Invoice[];
  quotations: Quotation[];
  receipts: Receipt[];
  transactions: Transaction[];
  vendors: VendorContractor[];
  onSelectSubTab: (tab: string) => void;
}

export const DepartmentOverviewTab: React.FC<DepartmentOverviewTabProps> = ({
  deptId,
  companySettings,
  invoices,
  quotations,
  receipts,
  transactions,
  vendors,
  onSelectSubTab,
}) => {
  const deptInfo = DEPARTMENTS.find((d) => d.id === deptId) || DEPARTMENTS[0];

  const deptInvoices = invoices.filter((i) => i.deptId === deptId);
  const deptQuotations = quotations.filter((q) => q.deptId === deptId);
  const deptVendors = vendors.filter((v) => v.deptId === deptId);
  const deptTransactions = transactions.filter((t) => t.deptId === deptId);

  const totalInvoiced = deptInvoices.reduce((acc, i) => acc + i.totalAmount, 0);
  const collectedRevenue = deptInvoices.reduce((acc, i) => acc + (i.paidAmount || 0), 0);
  const outstandingBalance = deptInvoices.reduce((acc, i) => acc + i.balanceDue, 0);
  const totalExpenses = deptTransactions
    .filter((t) => t.transactionType === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const getDeptIcon = () => {
    switch (deptId) {
      case 'design':
        return <Compass className="w-6 h-6 text-blue-400" />;
      case 'rebar':
        return <Layers className="w-6 h-6 text-amber-400" />;
      case 'qs':
        return <Calculator className="w-6 h-6 text-emerald-400" />;
      case 'architecture':
        return <Building2 className="w-6 h-6 text-purple-400" />;
      default:
        return <Building2 className="w-6 h-6 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Department Banner */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-inner">
            {getDeptIcon()}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-black text-white">{deptInfo.name}</h2>
              <span className="text-xs font-mono font-bold bg-zinc-900 text-emerald-400 px-2.5 py-0.5 rounded border border-zinc-800">
                [{deptInfo.code}]
              </span>
            </div>
            <p className="text-xs font-medium text-zinc-300 mt-1 max-w-xl">{deptInfo.description}</p>
          </div>
        </div>

        {/* Action Shortcuts */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => onSelectSubTab('invoices')}
            className="flex items-center space-x-1 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md transition-all border border-emerald-500"
          >
            <span>Invoices</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onSelectSubTab('vendors')}
            className="flex items-center space-x-1 px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border border-zinc-700 text-xs font-bold rounded-xl transition-all"
          >
            <span>Vendors</span>
          </button>
        </div>
      </div>

      {/* Department KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 shadow-sm">
          <p className="text-[10px] uppercase font-bold text-zinc-300 tracking-wider">Total Revenue</p>
          <p className="text-xl font-black text-emerald-400 mt-1">
            {formatCurrency(collectedRevenue, companySettings)}
          </p>
          <p className="text-[11px] font-semibold text-zinc-300 mt-2 pt-2 border-t border-zinc-800">
            Invoiced: {formatCurrency(totalInvoiced, companySettings)}
          </p>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 shadow-sm">
          <p className="text-[10px] uppercase font-bold text-zinc-300 tracking-wider">Total Expenses</p>
          <p className="text-xl font-black text-rose-400 mt-1">
            {formatCurrency(totalExpenses, companySettings)}
          </p>
          <p className="text-[11px] font-semibold text-zinc-300 mt-2 pt-2 border-t border-zinc-800">
            Software, Subcontractors &amp; Labs
          </p>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 shadow-sm">
          <p className="text-[10px] uppercase font-bold text-zinc-300 tracking-wider">Receivables Due</p>
          <p className="text-xl font-black text-amber-400 mt-1">
            {formatCurrency(outstandingBalance, companySettings)}
          </p>
          <p className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800">
            Pending Client Collections
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <p className="text-[10px] uppercase font-semibold text-slate-400">Active Partners</p>
          <p className="text-xl font-bold text-white mt-1">{deptVendors.length} Entities</p>
          <p className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800">
            Contractors, Vendors & Subcontractors
          </p>
        </div>
      </div>

      {/* Two Column Cards: Active Quotations & Recent Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Invoices */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Department Invoices & Status</span>
            </h3>
            <button
              onClick={() => onSelectSubTab('invoices')}
              className="text-xs text-indigo-400 hover:underline font-semibold"
            >
              View All ({deptInvoices.length}) →
            </button>
          </div>

          <div className="space-y-2">
            {deptInvoices.slice(0, 4).map((inv) => (
              <div
                key={inv.id}
                className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-bold text-white">{inv.projectTitle}</p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {inv.invoiceNo} • {inv.clientName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-200">
                    {formatCurrency(inv.totalAmount, companySettings)}
                  </p>
                  <span
                    className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      inv.status === 'paid'
                        ? 'bg-emerald-950 text-emerald-400'
                        : 'bg-amber-950 text-amber-400'
                    }`}
                  >
                    {inv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Vendors */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span>Contractors & Subcontractors</span>
            </h3>
            <button
              onClick={() => onSelectSubTab('vendors')}
              className="text-xs text-indigo-400 hover:underline font-semibold"
            >
              View All ({deptVendors.length}) →
            </button>
          </div>

          <div className="space-y-2">
            {deptVendors.slice(0, 4).map((v) => (
              <div
                key={v.id}
                className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-bold text-white">{v.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {v.code} • {v.category}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-400">
                    Paid: {formatCurrency(v.totalPaid, companySettings)}
                  </p>
                  <p className="text-[10px] text-amber-400">
                    Due: {formatCurrency(v.balanceDue, companySettings)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
