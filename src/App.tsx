import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  DepartmentId,
  User,
  CompanySettings,
  VendorContractor,
  Quotation,
  Invoice,
  Receipt,
  Transaction,
} from './types';
import { Storage } from './utils/storage';
import { PinLogin } from './components/PinLogin';
import { Header } from './components/Header';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { DepartmentView } from './components/DepartmentView';
import { VendorModal } from './components/modals/VendorModal';
import { QuotationModal } from './components/modals/QuotationModal';
import { InvoiceModal } from './components/modals/InvoiceModal';
import { ReceiptModal } from './components/modals/ReceiptModal';
import { TransactionModal } from './components/modals/TransactionModal';
import { AdminSettingsModal } from './components/modals/AdminSettingsModal';
import { ViewInvoiceModal } from './components/modals/ViewInvoiceModal';
import { CheckCircle } from 'lucide-react';

// ─── In-memory sequential number counter ───
const docCounters: Record<string, number> = {};

function scanDocNo(docNo: string, prefix: string) {
  if (!docNo || !docNo.startsWith(prefix)) return;
  const parts = docNo.split('-');
  // Format: TDQS-QTE-yymm-00x → parts: ['TDQS','QTE','yymm','00x']
  if (parts.length === 4) {
    const key = `${parts[0]}-${parts[1]}-${parts[2]}`;
    const seq = parseInt(parts[3], 10);
    if (!isNaN(seq)) {
      docCounters[key] = Math.max(docCounters[key] || 0, seq);
    }
  }
}

function initCounters(
  quotations: Quotation[],
  invoices: Invoice[],
  receipts: Receipt[]
) {
  quotations.forEach((q) => scanDocNo(q.quotationNo, 'TDQS-QTE'));
  invoices.forEach((i) => scanDocNo(i.invoiceNo, 'TDQS-INV'));
  receipts.forEach((r) => scanDocNo(r.receiptNo, 'TDQS-RCPT'));
}

function getNextDocNo(prefix: string): string {
  const now = new Date();
  const yymm =
    String(now.getFullYear()).slice(-2) +
    String(now.getMonth() + 1).padStart(2, '0');
  const key = `${prefix}-${yymm}`;
  docCounters[key] = (docCounters[key] || 0) + 1;
  return `${prefix}-${yymm}-${String(docCounters[key]).padStart(3, '0')}`;
}

export default function App() {
  // Persistence States
  const [users, setUsers] = useState<User[]>(() => Storage.getUsers());
  const [companySettings, setCompanySettings] = useState<CompanySettings>(() =>
    Storage.getCompanySettings()
  );
  const [vendors, setVendors] = useState<VendorContractor[]>(() => Storage.getVendors());
  const [quotations, setQuotations] = useState<Quotation[]>(() => Storage.getQuotations());
  const [invoices, setInvoices] = useState<Invoice[]>(() => Storage.getInvoices());
  const [receipts, setReceipts] = useState<Receipt[]>(() => Storage.getReceipts());
  const [transactions, setTransactions] = useState<Transaction[]>(() => Storage.getTransactions());

  // Initialize counters from existing data on first load
  useEffect(() => {
    initCounters(quotations, invoices, receipts);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Current User Session
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedId = Storage.getCurrentUserId();
    if (savedId) {
      const found = users.find((u) => u.id === savedId);
      if (found) return found;
    }
    return null;
  });

  // Active View Department
  const [activeDeptId, setActiveDeptId] = useState<DepartmentId>('all');

  // Notification Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Modal Visibility States
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<VendorContractor | null>(null);

  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);
  const [suggestedQteNo, setSuggestedQteNo] = useState('');

  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [suggestedInvNo, setSuggestedInvNo] = useState('');

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptInvoice, setReceiptInvoice] = useState<Invoice | null>(null);
  const [suggestedRcptNo, setSuggestedRcptNo] = useState('');

  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<Invoice | Quotation | null>(null);
  const [viewType, setViewType] = useState<'invoice' | 'quotation'>('invoice');

  // Filter vendors for current department context
  const contextVendors = useMemo(() => {
    if (activeDeptId === 'all') return vendors;
    return vendors.filter((v) => v.deptId === activeDeptId || v.status === 'active');
  }, [vendors, activeDeptId]);

  // Sync to Storage on changes
  useEffect(() => { Storage.setUsers(users); }, [users]);
  useEffect(() => { Storage.setCompanySettings(companySettings); }, [companySettings]);
  useEffect(() => { Storage.setVendors(vendors); }, [vendors]);
  useEffect(() => { Storage.setQuotations(quotations); }, [quotations]);
  useEffect(() => { Storage.setInvoices(invoices); }, [invoices]);
  useEffect(() => { Storage.setReceipts(receipts); }, [receipts]);
  useEffect(() => { Storage.setTransactions(transactions); }, [transactions]);

  // Handle Login & Logout
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    Storage.setCurrentUserId(user.id);
    if (user.role !== 'admin' && user.departmentId !== 'all') {
      setActiveDeptId(user.departmentId);
    } else {
      setActiveDeptId('all');
    }
    showToast(`Welcome back, ${user.name}!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    Storage.setCurrentUserId(null);
    showToast('Logged out securely.', 'info');
  };

  // ★ ADD THIS NEW HANDLER ★
  const handleSaveAll = () => {
    // Force-write all current state to localStorage
    Storage.setUsers(users);
    Storage.setCompanySettings(companySettings);
    Storage.setVendors(vendors);
    Storage.setQuotations(quotations);
    Storage.setInvoices(invoices);
    Storage.setReceipts(receipts);
    Storage.setTransactions(transactions);
    showToast('All data saved successfully!');
  };

  // Vendor Handlers
  const handleSaveVendor = (vendorData: Partial<VendorContractor>) => {
    let updated: VendorContractor[];
    if (editingVendor) {
      updated = vendors.map((v) => (v.id === editingVendor.id ? ({ ...v, ...vendorData } as VendorContractor) : v));
      showToast('Vendor updated successfully.');
    } else {
      updated = [vendorData as VendorContractor, ...vendors];
      showToast('New vendor added.');
    }
    setVendors(updated);
  };

  const handleDeleteVendor = (vendorId: string) => {
    if (confirm('Delete this contractor/vendor record?')) {
      setVendors(vendors.filter((v) => v.id !== vendorId));
      showToast('Vendor record deleted.', 'info');
    }
  };

  // Quotation Handlers
  const handleSaveQuotation = (qData: Partial<Quotation>) => {
    let updated: Quotation[];
    if (editingQuotation) {
      updated = quotations.map((q) => (q.id === editingQuotation.id ? ({ ...q, ...qData } as Quotation) : q));
      showToast('Quotation updated successfully.');
    } else {
      updated = [qData as Quotation, ...quotations];
      showToast('New quotation created.');
    }
    setQuotations(updated);
  };

  const handleDeleteQuotation = (qId: string) => {
    if (confirm('Delete this quotation estimate?')) {
      setQuotations(quotations.filter((q) => q.id !== qId));
      showToast('Quotation deleted.', 'info');
    }
  };

  const handleConvertToInvoice = (q: Quotation) => {
    const newInvoice: Invoice = {
      id: `inv_conv_${Date.now()}`,
      invoiceNo: getNextDocNo('TDQS-INV'),
      deptId: q.deptId,
      quotationId: q.id,
      clientName: q.clientName,
      clientEmail: q.clientEmail,
      projectTitle: q.projectTitle,
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      status: 'pending',
      items: q.items,
      subtotal: q.subtotal,
      taxRate: q.taxRate,
      taxAmount: q.taxAmount,
      discount: q.discount,
      totalAmount: q.totalAmount,
      paidAmount: 0,
      balanceDue: q.totalAmount,
      notes: `Converted from estimate ${q.quotationNo}`,
      paymentTerms: 'Net 30 Days',
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setInvoices([newInvoice, ...invoices]);
    showToast(`Quotation ${q.quotationNo} converted to Invoice ${newInvoice.invoiceNo}!`);
  };

  // Invoice Handlers
  const handleSaveInvoice = (invData: Partial<Invoice>) => {
    // Guard: paidAmount must not exceed totalAmount
    const data = { ...invData };
    if (data.paidAmount && data.totalAmount && data.paidAmount > data.totalAmount) {
      data.paidAmount = data.totalAmount;
      data.balanceDue = 0;
    }
    let updated: Invoice[];
    if (editingInvoice) {
      updated = invoices.map((i) => (i.id === editingInvoice.id ? ({ ...i, ...data } as Invoice) : i));
      showToast('Invoice updated successfully.');
    } else {
      updated = [data as Invoice, ...invoices];
      showToast('New invoice issued.');
    }
    setInvoices(updated);
  };

  const handleDeleteInvoice = (invId: string) => {
    if (confirm('Delete this invoice record?')) {
      setInvoices(invoices.filter((i) => i.id !== invId));
      showToast('Invoice deleted.', 'info');
    }
  };

  // Receipt Handlers — FIXED: No longer auto-creates duplicate transactions
  const handleSaveReceipt = (recData: Partial<Receipt>) => {
    const newReceipt = recData as Receipt;
    setReceipts([newReceipt, ...receipts]);

    // Update linked invoice paid amount
    if (newReceipt.invoiceNo) {
      const updatedInvoices = invoices.map((inv) => {
        if (inv.invoiceNo === newReceipt.invoiceNo || inv.id === newReceipt.invoiceNo) {
          const newPaid = (inv.paidAmount || 0) + newReceipt.amount;
          const newBalance = Math.max(0, inv.totalAmount - newPaid);
          let newStatus: Invoice['status'] = 'partial';
          if (newBalance <= 0) newStatus = 'paid';
          else if (newPaid <= 0) newStatus = 'pending';
          return {
            ...inv,
            paidAmount: Math.min(newPaid, inv.totalAmount),
            balanceDue: newBalance,
            status: newStatus,
          };
        }
        return inv;
      });
      setInvoices(updatedInvoices);
    }

    // NO auto-transaction creation — income/expense derives from receipts
    showToast(`Payment receipt ${newReceipt.receiptNo} recorded!`);
  };

  const handleDeleteReceipt = (receiptId: string) => {
    if (confirm('Delete receipt record? This will reverse the linked invoice payment.')) {
      const receipt = receipts.find((r) => r.id === receiptId);
      setReceipts(receipts.filter((r) => r.id !== receiptId));

      // Reverse the invoice paid amount
      if (receipt && receipt.invoiceNo) {
        const updatedInvoices = invoices.map((inv) => {
          if (inv.invoiceNo === receipt.invoiceNo || inv.id === receipt.invoiceNo) {
            const newPaid = Math.max(0, (inv.paidAmount || 0) - receipt.amount);
            const newBalance = Math.max(0, inv.totalAmount - newPaid);
            let newStatus: Invoice['status'] = 'pending';
            if (newPaid >= inv.totalAmount) newStatus = 'paid';
            else if (newPaid > 0) newStatus = 'partial';
            return { ...inv, paidAmount: newPaid, balanceDue: newBalance, status: newStatus };
          }
          return inv;
        });
        setInvoices(updatedInvoices);
      }

      // Also clean up any legacy auto-created transactions linked to this receipt
      setTransactions((prev) => prev.filter((t) => t.receiptId !== receiptId));

      showToast('Receipt record deleted.', 'info');
    }
  };

  // Transaction Handlers — for MANUAL entries only (no receiptId)
  const handleSaveTransaction = (txData: Partial<Transaction>) => {
    setTransactions([txData as Transaction, ...transactions]);
    showToast('Transaction recorded into ledger.');
  };

  const handleDeleteTransaction = (txId: string) => {
    if (confirm('Delete ledger entry?')) {
      setTransactions(transactions.filter((t) => t.id !== txId));
      showToast('Transaction deleted.', 'info');
    }
  };

  // Full Backup Restore
  const handleImportFullBackup = (data: any) => {
    if (data.users) setUsers(data.users);
    if (data.companySettings) setCompanySettings(data.companySettings);
    if (data.vendors) setVendors(data.vendors);
    if (data.quotations) setQuotations(data.quotations);
    if (data.invoices) setInvoices(data.invoices);
    if (data.receipts) setReceipts(data.receipts);
    if (data.transactions) setTransactions(data.transactions);
    // Re-initialize counters from imported data
    initCounters(
      data.quotations || quotations,
      data.invoices || invoices,
      data.receipts || receipts
    );
    showToast('Full system backup imported successfully!');
  };

  const handleResetFactoryData = () => {
    Storage.resetAllData();
    setUsers(Storage.getUsers());
    setCompanySettings(Storage.getCompanySettings());
    setVendors(Storage.getVendors());
    setQuotations(Storage.getQuotations());
    setInvoices(Storage.getInvoices());
    setReceipts(Storage.getReceipts());
    setTransactions(Storage.getTransactions());
    // Clear and re-init counters
    Object.keys(docCounters).forEach((k) => delete docCounters[k]);
    initCounters(Storage.getQuotations(), Storage.getInvoices(), Storage.getReceipts());
    showToast('Data reset to factory seed values.', 'info');
  };

  // Department Selection Protection Handler
  const handleSelectDepartment = (id: DepartmentId) => {
    if (currentUser && currentUser.role !== 'admin' && currentUser.departmentId !== 'all') {
      if (id !== 'all' && id !== currentUser.departmentId) {
        setActiveDeptId(currentUser.departmentId);
        return;
      }
    }
    setActiveDeptId(id);
  };

  // If user is not logged in, render PIN Keypad Screen
  if (!currentUser) {
    return <PinLogin users={users} onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen app-background text-slate-100 font-sans selection:bg-emerald-600 selection:text-white">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 flex items-center space-x-2.5 bg-zinc-900 border border-emerald-500/60 text-white px-4 py-2.5 rounded-xl shadow-2xl animate-fade-in text-xs font-bold">
          <CheckCircle className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
          <span>{toast.message}</span>
        </div>
      )}

      <Header
        currentUser={currentUser}
        companySettings={companySettings}
        activeDeptId={activeDeptId}
        onSelectDepartment={handleSelectDepartment}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        onLogout={handleLogout}
        onSaveAll={handleSaveAll}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeDeptId === 'all' ? (
          <ExecutiveDashboard
            companySettings={companySettings}
            invoices={invoices}
            quotations={quotations}
            receipts={receipts}
            transactions={transactions}
            vendors={vendors}
            onSelectDepartment={handleSelectDepartment}
            onOpenCreateInvoice={() => {
              setEditingInvoice(null);
              setSuggestedInvNo(getNextDocNo('TDQS-INV'));
              setIsInvoiceModalOpen(true);
            }}
            onOpenCreateQuotation={() => {
              setEditingQuotation(null);
              setSuggestedQteNo(getNextDocNo('TDQS-QTE'));
              setIsQuotationModalOpen(true);
            }}
            onOpenCreateExpense={() => setIsTransactionModalOpen(true)}
            onOpenCreateVendor={() => {
              setEditingVendor(null);
              setIsVendorModalOpen(true);
            }}
          />
        ) : (
          <DepartmentView
            deptId={activeDeptId}
            currentUser={currentUser}
            companySettings={companySettings}
            users={users}
            vendors={vendors}
            quotations={quotations}
            invoices={invoices}
            receipts={receipts}
            transactions={transactions}
            onOpenCreateVendor={() => {
              setEditingVendor(null);
              setIsVendorModalOpen(true);
            }}
            onOpenEditVendor={(v) => {
              setEditingVendor(v);
              setIsVendorModalOpen(true);
            }}
            onDeleteVendor={handleDeleteVendor}
            onOpenCreateQuotation={() => {
              setEditingQuotation(null);
              setSuggestedQteNo(getNextDocNo('TDQS-QTE'));
              setIsQuotationModalOpen(true);
            }}
            onOpenEditQuotation={(q) => {
              setEditingQuotation(q);
              setSuggestedQteNo(q.quotationNo);
              setIsQuotationModalOpen(true);
            }}
            onDeleteQuotation={handleDeleteQuotation}
            onConvertToInvoice={handleConvertToInvoice}
            onViewQuotation={(q) => {
              setViewingDoc(q);
              setViewType('quotation');
              setIsViewModalOpen(true);
            }}
            onOpenCreateInvoice={() => {
              setEditingInvoice(null);
              setSuggestedInvNo(getNextDocNo('TDQS-INV'));
              setIsInvoiceModalOpen(true);
            }}
            onOpenEditInvoice={(inv) => {
              setEditingInvoice(inv);
              setSuggestedInvNo(inv.invoiceNo);
              setIsInvoiceModalOpen(true);
            }}
            onDeleteInvoice={handleDeleteInvoice}
            onViewInvoice={(inv) => {
              setViewingDoc(inv);
              setViewType('invoice');
              setIsViewModalOpen(true);
            }}
            onRecordPayment={(inv) => {
              setReceiptInvoice(inv);
              setSuggestedRcptNo(getNextDocNo('TDQS-RCPT'));
              setIsReceiptModalOpen(true);
            }}
            onOpenCreateReceipt={() => {
              setReceiptInvoice(null);
              setSuggestedRcptNo(getNextDocNo('TDQS-RCPT'));
              setIsReceiptModalOpen(true);
            }}
            onDeleteReceipt={handleDeleteReceipt}
            onOpenCreateTransaction={() => setIsTransactionModalOpen(true)}
            onDeleteTransaction={handleDeleteTransaction}
            onImportFullBackup={handleImportFullBackup}
            onResetFactoryData={handleResetFactoryData}
          />
        )}
      </main>

      {/* Modals */}
      <VendorModal
        isOpen={isVendorModalOpen}
        onClose={() => setIsVendorModalOpen(false)}
        onSave={handleSaveVendor}
        initialData={editingVendor}
        defaultDeptId={activeDeptId}
      />

      <QuotationModal
        isOpen={isQuotationModalOpen}
        onClose={() => setIsQuotationModalOpen(false)}
        onSave={handleSaveQuotation}
        initialData={editingQuotation}
        defaultDeptId={activeDeptId}
        companySettings={companySettings}
        vendors={contextVendors}
        suggestedNo={suggestedQteNo}
      />

      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        onSave={handleSaveInvoice}
        initialData={editingInvoice}
        defaultDeptId={activeDeptId}
        companySettings={companySettings}
        vendors={contextVendors}
        suggestedNo={suggestedInvNo}
      />

      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        onSave={handleSaveReceipt}
        defaultDeptId={activeDeptId}
        initialInvoice={receiptInvoice}
        companySettings={companySettings}
        vendors={contextVendors}
        suggestedNo={suggestedRcptNo}
      />

      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        onSave={handleSaveTransaction}
        defaultDeptId={activeDeptId}
        companySettings={companySettings}
        vendors={contextVendors}
      />

      <AdminSettingsModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        users={users}
        onSaveUsers={(u) => setUsers(u)}
        companySettings={companySettings}
        onSaveCompanySettings={(s) => setCompanySettings(s)}
      />

      <ViewInvoiceModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        document={viewingDoc}
        type={viewType}
        companySettings={companySettings}
      />
    </div>
  );
}
