import React, { useState } from 'react';
import {
  DepartmentId,
  Invoice,
  Quotation,
  Receipt,
  Transaction,
  VendorContractor,
  CompanySettings,
  User,
} from '../types';
import { DepartmentOverviewTab } from './subtabs/DepartmentOverviewTab';
import { VendorsContractorsTab } from './subtabs/VendorsContractorsTab';
import { QuotationsTab } from './subtabs/QuotationsTab';
import { InvoicesTab } from './subtabs/InvoicesTab';
import { ReceiptsTab } from './subtabs/ReceiptsTab';
import { IncomeExpensesTab } from './subtabs/IncomeExpensesTab';
import { ExportReportsTab } from './subtabs/ExportReportsTab';

import {
  LayoutDashboard,
  Users,
  FileText,
  Receipt as ReceiptIcon,
  TrendingDown,
  FileSpreadsheet,
  CheckSquare,
} from 'lucide-react';

interface DepartmentViewProps {
  deptId: DepartmentId;
  currentUser: User;
  companySettings: CompanySettings;
  users: User[];
  vendors: VendorContractor[];
  quotations: Quotation[];
  invoices: Invoice[];
  receipts: Receipt[];
  transactions: Transaction[];

  onOpenCreateVendor: () => void;
  onOpenEditVendor: (v: VendorContractor) => void;
  onDeleteVendor: (id: string) => void;

  onOpenCreateQuotation: () => void;
  onOpenEditQuotation: (q: Quotation) => void;
  onDeleteQuotation: (id: string) => void;
  onConvertToInvoice: (q: Quotation) => void;
  onViewQuotation: (q: Quotation) => void;

  onOpenCreateInvoice: () => void;
  onOpenEditInvoice: (inv: Invoice) => void;
  onDeleteInvoice: (id: string) => void;
  onViewInvoice: (inv: Invoice) => void;
  onRecordPayment: (inv: Invoice) => void;

  onOpenCreateReceipt: () => void;
  onDeleteReceipt: (id: string) => void;
  onViewReceipt: (r: Receipt) => void;

  onOpenCreateTransaction: () => void;
  onDeleteTransaction: (id: string) => void;

  onImportFullBackup: (data: any) => void;
  onResetFactoryData: () => void;
}

export type SubTabId = 'overview' | 'vendors' | 'quotations' | 'invoices' | 'receipts' | 'finance' | 'export';

export const DepartmentView: React.FC<DepartmentViewProps> = ({
  deptId,
  currentUser,
  companySettings,
  users,
  vendors,
  quotations,
  invoices,
  receipts,
  transactions,
  onOpenCreateVendor,
  onOpenEditVendor,
  onDeleteVendor,
  onOpenCreateQuotation,
  onOpenEditQuotation,
  onDeleteQuotation,
  onConvertToInvoice,
  onViewQuotation,
  onOpenCreateInvoice,
  onOpenEditInvoice,
  onDeleteInvoice,
  onViewInvoice,
  onRecordPayment,
  onOpenCreateReceipt,
  onDeleteReceipt,
  onOpenCreateTransaction,
  onDeleteTransaction,
  onImportFullBackup,
  onResetFactoryData,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTabId>('overview');

  // Permissions check
  const canEdit =
    currentUser.role === 'admin' || currentUser.departmentId === 'all' || currentUser.departmentId === deptId;

  const subTabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'vendors', label: 'Contractors & Vendors', icon: Users, count: vendors.filter(v => deptId === 'all' || v.deptId === deptId).length },
    { id: 'quotations', label: 'Quotations & Estimates', icon: FileText, count: quotations.filter(q => deptId === 'all' || q.deptId === deptId).length },
    { id: 'invoices', label: 'Invoices & Billing', icon: CheckSquare, count: invoices.filter(i => deptId === 'all' || i.deptId === deptId).length },
    { id: 'receipts', label: 'Receipts & Clearance', icon: ReceiptIcon, count: receipts.filter(r => deptId === 'all' || r.deptId === deptId).length },
    { id: 'finance', label: 'Income & Expenses', icon: TrendingDown, count: transactions.filter(t => deptId === 'all' || t.deptId === deptId).length },
    { id: 'export', label: 'Export & Reports', icon: FileSpreadsheet },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Sub-Tabs Bar */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-1.5 shadow-md overflow-x-auto scrollbar-none">
        <div className="flex space-x-1 min-w-max">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as SubTabId)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-md shadow-emerald-950/50 border border-emerald-500'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-emerald-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      isActive ? 'bg-emerald-900 text-emerald-100' : 'bg-zinc-900 text-zinc-300 border border-zinc-800'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Render Active Sub-Tab */}
      {activeSubTab === 'overview' && (
        <DepartmentOverviewTab
          deptId={deptId}
          companySettings={companySettings}
          invoices={invoices}
          quotations={quotations}
          receipts={receipts}
          transactions={transactions}
          vendors={vendors}
          onSelectSubTab={(tab) => setActiveSubTab(tab as SubTabId)}
        />
      )}

      {activeSubTab === 'vendors' && (
        <VendorsContractorsTab
          deptId={deptId}
          vendors={vendors}
          companySettings={companySettings}
          canEdit={canEdit}
          onOpenCreateVendor={onOpenCreateVendor}
          onOpenEditVendor={onOpenEditVendor}
          onDeleteVendor={onDeleteVendor}
        />
      )}

      {activeSubTab === 'quotations' && (
        <QuotationsTab
          deptId={deptId}
          quotations={quotations}
          companySettings={companySettings}
          canEdit={canEdit}
          onOpenCreateQuotation={onOpenCreateQuotation}
          onOpenEditQuotation={onOpenEditQuotation}
          onDeleteQuotation={onDeleteQuotation}
          onConvertToInvoice={onConvertToInvoice}
          onViewQuotation={onViewQuotation}
        />
      )}

      {activeSubTab === 'invoices' && (
        <InvoicesTab
          deptId={deptId}
          invoices={invoices}
          companySettings={companySettings}
          canEdit={canEdit}
          onOpenCreateInvoice={onOpenCreateInvoice}
          onOpenEditInvoice={onOpenEditInvoice}
          onDeleteInvoice={onDeleteInvoice}
          onViewInvoice={onViewInvoice}
          onRecordPayment={onRecordPayment}
        />
      )}

      {activeSubTab === 'receipts' && (
        <ReceiptsTab
          deptId={deptId}
          receipts={receipts}
          companySettings={companySettings}
          canEdit={canEdit}
          onOpenCreateReceipt={onOpenCreateReceipt}
          onDeleteReceipt={onDeleteReceipt}
        />
      )}

      {activeSubTab === 'receipts' && (
        <ReceiptsTab
          deptId={deptId}
          receipts={receipts}
          companySettings={companySettings}
          canEdit={canEdit}
          onOpenCreateReceipt={onOpenCreateReceipt}
          onDeleteReceipt={onDeleteReceipt}
          onViewReceipt={onViewReceipt}
        />
      )}

      {activeSubTab === 'finance' && (
        <IncomeExpensesTab
          deptId={deptId}
          transactions={transactions}
          companySettings={companySettings}
          canEdit={canEdit}
          onOpenCreateTransaction={onOpenCreateTransaction}
          onDeleteTransaction={onDeleteTransaction}
        />
      )}

      {activeSubTab === 'export' && (
        <ExportReportsTab
          deptId={deptId}
          companySettings={companySettings}
          users={users}
          vendors={vendors}
          quotations={quotations}
          invoices={invoices}
          receipts={receipts}
          transactions={transactions}
          onImportFullBackup={onImportFullBackup}
          onResetFactoryData={onResetFactoryData}
          canEdit={canEdit}
        />
      )}
    </div>
  );
};
