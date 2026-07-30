import React from 'react';
import {
  DepartmentId,
  Invoice,
  Quotation,
  Receipt,
  Transaction,
  VendorContractor,
  CompanySettings,
} from '../types';
import { DEPARTMENTS } from '../data/initialData';
import { formatCurrency } from '../utils/export';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Users,
  Building2,
  Compass,
  Layers,
  Calculator,
  ArrowRight,
  ShieldCheck,
  PlusCircle,
  Receipt as ReceiptIcon,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';

interface ExecutiveDashboardProps {
  companySettings: CompanySettings;
  invoices: Invoice[];
  quotations: Quotation[];
  receipts: Receipt[];
  transactions: Transaction[];
  vendors: VendorContractor[];
  onSelectDepartment: (deptId: DepartmentId) => void;
  onOpenCreateInvoice: () => void;
  onOpenCreateQuotation: () => void;
  onOpenCreateExpense: () => void;
  onOpenCreateVendor: () => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  companySettings,
  invoices,
  quotations,
  receipts,
  transactions,
  vendors,
  onSelectDepartment,
  onOpenCreateInvoice,
  onOpenCreateQuotation,
  onOpenCreateExpense,
  onOpenCreateVendor,
}) => {
  // Financial Calculations
  const totalRevenue = invoices.reduce((acc, inv) => acc + (inv.paidAmount || 0), 0);
  const totalInvoiced = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
  const totalOutstanding = invoices.reduce((acc, inv) => acc + inv.balanceDue, 0);

  const totalExpenses = transactions
    .filter((tx) => tx.transactionType === 'expense')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  const totalQuotationsValue = quotations.reduce((acc, q) => acc + q.totalAmount, 0);

  // Department Breakdown
  const getDeptStats = (deptId: DepartmentId) => {
    const deptInvoices = invoices.filter((i) => i.deptId === deptId);
    const deptRevenue = deptInvoices.reduce((acc, i) => acc + i.paidAmount, 0);
    const deptOutstanding = deptInvoices.reduce((acc, i) => acc + i.balanceDue, 0);
    const deptExpenses = transactions
      .filter((t) => t.deptId === deptId && t.transactionType === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
    const deptVendors = vendors.filter((v) => v.deptId === deptId).length;
    const deptQuotations = quotations.filter((q) => q.deptId === deptId).length;

    return {
      revenue: deptRevenue,
      expenses: deptExpenses,
      outstanding: deptOutstanding,
      vendors: deptVendors,
      quotationsCount: deptQuotations,
      net: deptRevenue - deptExpenses,
    };
  };

  const getDeptIcon = (id: DepartmentId) => {
    switch (id) {
      case 'design':
        return <Compass className="w-5 h-5 text-blue-400" />;
      case 'rebar':
        return <Layers className="w-5 h-5 text-amber-400" />;
      case 'qs':
        return <Calculator className="w-5 h-5 text-emerald-400" />;
      case 'architecture':
        return <Building2 className="w-5 h-5 text-purple-400" />;
      default:
        return <Building2 className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 pb-12 text-white">
      {/* Top Welcome & Quick Actions Header */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-xs font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
              Executive Dashboard
            </span>
            <span className="text-xs font-semibold text-zinc-300">• Thulir Design &amp; QS Services FZE</span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1.5 tracking-tight">
            Overall Departmental Financial Overview
          </h2>
          <p className="text-xs font-medium text-zinc-300 mt-1">
            Unified billing, vendor contracts, rebar detailing logs, architectural designs, and cost estimations in AED.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenCreateInvoice}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/40 border border-emerald-500 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Invoice</span>
          </button>
          <button
            onClick={onOpenCreateQuotation}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border border-zinc-700 text-xs font-bold rounded-xl transition-all"
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>New Quotation</span>
          </button>
          <button
            onClick={onOpenCreateExpense}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border border-zinc-700 text-xs font-bold rounded-xl transition-all"
          >
            <TrendingDown className="w-4 h-4 text-rose-400" />
            <span>Record Expense</span>
          </button>
          <button
            onClick={onOpenCreateVendor}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border border-zinc-700 text-xs font-bold rounded-xl transition-all"
          >
            <Users className="w-4 h-4 text-emerald-300" />
            <span>Add Vendor</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Collected Revenue */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Collected Revenue
            </span>
            <div className="w-9 h-9 bg-emerald-950 border border-emerald-700 text-emerald-400 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-2">
            {formatCurrency(totalRevenue, companySettings)}
          </p>
          <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-300 mt-2.5 pt-2.5 border-t border-zinc-800/80">
            <span>Invoiced: {formatCurrency(totalInvoiced, companySettings)}</span>
            <span className="text-emerald-400 font-bold">Cleared</span>
          </div>
        </div>

        {/* Operating Expenses */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Operating Expenses
            </span>
            <div className="w-9 h-9 bg-rose-950 border border-rose-800 text-rose-400 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-2">
            {formatCurrency(totalExpenses, companySettings)}
          </p>
          <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-300 mt-2.5 pt-2.5 border-t border-zinc-800/80">
            <span>Subcontractors &amp; Licensing</span>
            <span className="text-rose-400 font-bold">{transactions.length} records</span>
          </div>
        </div>

        {/* Net Operating Profit */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Net Profit
            </span>
            <div className="w-9 h-9 bg-emerald-950 border border-emerald-700 text-emerald-400 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-2">
            {formatCurrency(netProfit, companySettings)}
          </p>
          <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-300 mt-2.5 pt-2.5 border-t border-zinc-800/80">
            <span>Margin Percentage</span>
            <span className="text-emerald-400 font-bold">{profitMargin.toFixed(1)}%</span>
          </div>
        </div>

        {/* Receivables Outstanding */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Receivables Due
            </span>
            <div className="w-9 h-9 bg-amber-950 border border-amber-800 text-amber-400 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-400 mt-2">
            {formatCurrency(totalOutstanding, companySettings)}
          </p>
          <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-300 mt-2.5 pt-2.5 border-t border-zinc-800/80">
            <span>Unpaid Invoices</span>
            <span className="text-amber-400 font-bold">
              {invoices.filter((i) => i.balanceDue > 0).length} pending
            </span>
          </div>
        </div>
      </div>

      {/* Department Financial Comparison Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-black text-white">Department Breakdown</h3>
            <p className="text-xs font-medium text-zinc-300 mt-0.5">
              Select any department to open its dedicated accounting ledger and sub-tabs.
            </p>
          </div>
          <span className="text-xs font-bold text-zinc-300 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full">
            4 Active Departments
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {DEPARTMENTS.map((dept) => {
            const stats = getDeptStats(dept.id);
            return (
              <div
                key={dept.id}
                onClick={() => onSelectDepartment(dept.id)}
                className="bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-emerald-600/60 rounded-2xl p-5 transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-zinc-900 rounded-xl border border-zinc-800 group-hover:scale-110 transition-transform">
                        {getDeptIcon(dept.id)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                          {dept.name}
                        </h4>
                        <span className="text-[10px] text-zinc-300 font-mono">[{dept.code}]</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                  </div>

                  <p className="text-[11px] font-medium text-zinc-300 line-clamp-2 min-h-[32px]">
                    {dept.description}
                  </p>

                  <div className="mt-4 space-y-2 pt-3 border-t border-zinc-800">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-300">Collected Revenue:</span>
                      <span className="font-bold text-emerald-400">
                        {formatCurrency(stats.revenue, companySettings)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-300">Expenses:</span>
                      <span className="font-bold text-rose-400">
                        {formatCurrency(stats.expenses, companySettings)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-300">Balance Due:</span>
                      <span className="font-bold text-amber-400">
                        {formatCurrency(stats.outstanding, companySettings)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-300">
                  <span>{stats.vendors} Vendors/Contractors</span>
                  <span className="text-emerald-400 font-bold group-hover:underline">
                    View Ledger →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Section: Recent Transactions & Active Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices & Billing Status */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Recent Invoices across Departments</span>
            </h3>
            <span className="text-xs font-semibold text-zinc-300">{invoices.length} total</span>
          </div>

          <div className="space-y-2.5">
            {invoices.slice(0, 5).map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-800/80 rounded-xl text-xs hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div
                    className={`px-2 py-1 rounded text-[10px] font-mono font-bold uppercase shrink-0 ${
                      inv.status === 'paid'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : inv.status === 'partial'
                        ? 'bg-blue-950 text-blue-400 border border-blue-800'
                        : inv.status === 'overdue'
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}
                  >
                    {inv.status}
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-white truncate">{inv.projectTitle}</p>
                    <p className="text-[10px] text-zinc-300 font-mono">
                      {inv.invoiceNo} • {inv.clientName} • ({inv.deptId.toUpperCase()})
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="font-bold text-white">
                    {formatCurrency(inv.totalAmount, companySettings)}
                  </p>
                  <p className="text-[10px] text-zinc-300">Due {inv.dueDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Expense & Income Transactions Ledger */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <ReceiptIcon className="w-4 h-4 text-emerald-400" />
              <span>Verified Ledger Transactions</span>
            </h3>
            <span className="text-xs font-semibold text-zinc-300">{transactions.length} entries</span>
          </div>

          <div className="space-y-2.5">
            {transactions.slice(0, 5).map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-800/80 rounded-xl text-xs hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-bold ${
                      tx.transactionType === 'income'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}
                  >
                    {tx.transactionType === 'income' ? '+' : '-'}
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-white truncate">{tx.category}</p>
                    <p className="text-[10px] text-zinc-300 truncate">
                      {tx.payeeOrPayer} • ({tx.deptId.toUpperCase()})
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p
                    className={`font-bold ${
                      tx.transactionType === 'income' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {tx.transactionType === 'income' ? '+' : '-'}
                    {formatCurrency(tx.amount, companySettings)}
                  </p>
                  <p className="text-[10px] text-zinc-300">{tx.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
