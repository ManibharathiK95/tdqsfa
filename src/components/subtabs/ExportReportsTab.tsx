import React, { useRef } from 'react';
import {
  DepartmentId,
  Invoice,
  Quotation,
  Receipt,
  Transaction,
  VendorContractor,
  CompanySettings,
  User,
} from '../../types';
import { downloadCSV, downloadJSON, formatCurrency } from '../../utils/export';
import {
  Download,
  Upload,
  FileSpreadsheet,
  Database,
  RefreshCw,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface ExportReportsTabProps {
  deptId: DepartmentId;
  companySettings: CompanySettings;
  users: User[];
  vendors: VendorContractor[];
  quotations: Quotation[];
  invoices: Invoice[];
  receipts: Receipt[];
  transactions: Transaction[];
  onImportFullBackup: (data: any) => void;
  onResetFactoryData: () => void;
  canEdit: boolean;
}

export const ExportReportsTab: React.FC<ExportReportsTabProps> = ({
  deptId,
  companySettings,
  users,
  vendors,
  quotations,
  invoices,
  receipts,
  transactions,
  onImportFullBackup,
  onResetFactoryData,
  canEdit,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filterByDept = <T extends { deptId: DepartmentId }>(items: T[]): T[] => {
    if (deptId === 'all') return items;
    return items.filter((item) => item.deptId === deptId);
  };

  const filteredInvoices = filterByDept<Invoice>(invoices);
  const filteredQuotations = filterByDept<Quotation>(quotations);
  const filteredVendors = filterByDept<VendorContractor>(vendors);
  const filteredReceipts = filterByDept<Receipt>(receipts);
  const filteredTransactions = filterByDept<Transaction>(transactions);

  // Full Database Export to JSON
  const handleExportFullJSON = () => {
    const backupData = {
      version: '2.4',
      exportDate: new Date().toISOString(),
      companySettings,
      users,
      vendors,
      quotations,
      invoices,
      receipts,
      transactions,
    };
    downloadJSON(`TDQS_ERP_Full_Backup_${new Date().toISOString().slice(0, 10)}`, backupData);
  };

  // Import JSON File
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        onImportFullBackup(json);
      } catch (err) {
        alert('Invalid backup JSON file. Please check format.');
      }
    };
    reader.readAsText(file);
  };

  // CSV Exporters
  const exportInvoicesCSV = () => {
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

  const exportQuotationsCSV = () => {
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

  const exportVendorsCSV = () => {
    const rows = [
      ['Code', 'Dept', 'Name', 'Type', 'Category', 'Contact Person', 'Email', 'Phone', 'Total Billed', 'Total Paid', 'Balance Due', 'Status'],
      ...filteredVendors.map((v) => [
        v.code,
        v.deptId,
        v.name,
        v.type,
        v.category,
        v.contactPerson,
        v.email,
        v.phone,
        v.totalBilled,
        v.totalPaid,
        v.balanceDue,
        v.status,
      ]),
    ];
    downloadCSV(`vendors_${deptId}_${new Date().toISOString().slice(0, 10)}`, rows);
  };

  const exportReceiptsCSV = () => {
    const rows = [
      ['Receipt No', 'Dept', 'Type', 'Client/Vendor', 'Invoice Ref', 'Date', 'Payment Mode', 'Ref No', 'Amount', 'Status'],
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
    <div className="space-y-6">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-md">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Database className="w-5 h-5 text-emerald-400" />
          <span>Reports & Data Export Center</span>
        </h2>
        <p className="text-xs text-zinc-300 mt-1 font-medium">
          Export departmental data tables to CSV spreadsheet format or generate a full JSON database backup.
        </p>
      </div>

      {/* CSV Exporters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Invoices Export */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 font-bold mb-2">
              <FileSpreadsheet className="w-5 h-5" />
              <span>Invoices Ledger</span>
            </div>
            <p className="text-xs text-slate-400">
              {filteredInvoices.length} invoices ({deptId.toUpperCase()})
            </p>
          </div>
          <button
            onClick={exportInvoicesCSV}
            className="mt-4 w-full flex items-center justify-center space-x-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export Invoices CSV</span>
          </button>
        </div>

        {/* Quotations Export */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-amber-400 font-bold mb-2">
              <FileSpreadsheet className="w-5 h-5" />
              <span>Quotations / Estimates</span>
            </div>
            <p className="text-xs text-slate-400">
              {filteredQuotations.length} quotations ({deptId.toUpperCase()})
            </p>
          </div>
          <button
            onClick={exportQuotationsCSV}
            className="mt-4 w-full flex items-center justify-center space-x-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Export Quotations CSV</span>
          </button>
        </div>

        {/* Vendors Export */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-blue-400 font-bold mb-2">
              <FileSpreadsheet className="w-5 h-5" />
              <span>Contractors & Vendors</span>
            </div>
            <p className="text-xs text-slate-400">
              {filteredVendors.length} entities ({deptId.toUpperCase()})
            </p>
          </div>
          <button
            onClick={exportVendorsCSV}
            className="mt-4 w-full flex items-center justify-center space-x-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Export Vendors CSV</span>
          </button>
        </div>

        {/* Receipts Export */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 font-bold mb-2">
              <FileSpreadsheet className="w-5 h-5" />
              <span>Receipts & Clearance</span>
            </div>
            <p className="text-xs text-slate-400">
              {filteredReceipts.length} receipts ({deptId.toUpperCase()})
            </p>
          </div>
          <button
            onClick={exportReceiptsCSV}
            className="mt-4 w-full flex items-center justify-center space-x-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export Receipts CSV</span>
          </button>
        </div>
      </div>

      {/* Admin Full System Backup & Restore Section */}
      {canEdit && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">
              System Backup, Restore & Data Reset (Admin Control)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Full JSON Backup */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
              <p className="text-xs font-bold text-white">1. Full System Backup (.JSON)</p>
              <p className="text-[11px] text-slate-400">
                Downloads all users, 4-digit PINs, settings, vendors, invoices, quotations, and transactions into a single file.
              </p>
              <button
                onClick={handleExportFullJSON}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download Backup JSON</span>
              </button>
            </div>

            {/* Restore JSON Backup */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
              <p className="text-xs font-bold text-white">2. Restore Backup File</p>
              <p className="text-[11px] text-slate-400">
                Upload a previously saved `.json` database file to restore company data.
              </p>
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all"
              >
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>Upload Backup File</span>
              </button>
            </div>

            {/* Reset Factory Seed Data */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
              <p className="text-xs font-bold text-white">3. Reset Factory Seed Data</p>
              <p className="text-[11px] text-slate-400">
                Restores the system back to standard demo dataset for all 4 departments.
              </p>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to reset all data back to factory seeds?')) {
                    onResetFactoryData();
                  }
                }}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-bold rounded-xl transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reset to Seed Data</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
