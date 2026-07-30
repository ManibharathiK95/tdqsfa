import React, { useState, useEffect } from 'react';
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
import { CheckCircle, AlertCircle } from 'lucide-react';

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

  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptInvoice, setReceiptInvoice] = useState<Invoice | null>(null);

  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<Invoice | Quotation | null>(null);
  const [viewType, setViewType] = useState<'invoice' | 'quotation'>('invoice');

  // Sync to Storage on changes
  useEffect(() => {
    Storage.setUsers(users);
  }, [users]);

  useEffect(() => {
    Storage.setCompanySettings(companySettings);
  }, [companySettings]);

  useEffect(() => {
    Storage.setVendors(vendors);
  }, [vendors]);

  useEffect(() => {
    Storage.setQuotations(quotations);
  }, [quotations]);

  useEffect(() => {
    Storage.setInvoices(invoices);
  }, [invoices]);

  useEffect(() => {
    Storage.setReceipts(receipts);
  }, [receipts]);

  useEffect(() => {
    Storage.setTransactions(transactions);
  }, [transactions]);

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
      const updated = vendors.filter((v) => v.id !== vendorId);
      setVendors(updated);
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
      const updated = quotations.filter((q) => q.id !== qId);
      setQuotations(updated);
      showToast('Quotation deleted.', 'info');
    }
  };

  const handleConvertToInvoice = (q: Quotation) => {
    const newInvoice: Invoice = {
      id: `inv_conv_${Date.now()}`,
      invoiceNo: `INV-${q.deptId.toUpperCase()}-2026-${Math.floor(100 + Math.random() * 900)}`,
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
    let updated: Invoice[];
    if (editingInvoice) {
      updated = invoices.map((i) => (i.id === editingInvoice.id ? ({ ...i, ...invData } as Invoice) : i));
      showToast('Invoice updated successfully.');
    } else {
      updated = [invData as Invoice, ...invoices];
      showToast('New invoice issued.');
    }
    setInvoices(updated);
  };

  const handleDeleteInvoice = (invId: string) => {
    if (confirm('Delete this invoice record?')) {
      const updated = invoices.filter((i) => i.id !== invId);
      setInvoices(updated);
      showToast('Invoice deleted.', 'info');
    }
  };

  // Receipt Handlers
  const handleSaveReceipt = (recData: Partial<Receipt>) => {
    const newReceipt = recData as Receipt;
    setReceipts([newReceipt, ...receipts]);

    // Update invoice if linked
    if (newReceipt.invoiceNo) {
      const updatedInvoices = invoices.map((inv) => {
        if (inv.invoiceNo === newReceipt.invoiceNo || inv.id === newReceipt.invoiceNo) {
          const newPaid = (inv.paidAmount || 0) + newReceipt.amount;
          const newBalance = Math.max(0, inv.totalAmount - newPaid);
          const newStatus = newBalance === 0 ? 'paid' : 'partial';
          return {
            ...inv,
            paidAmount: newPaid,
            balanceDue: newBalance,
            status: newStatus as Invoice['status'],
          };
        }
        return inv;
      });
      setInvoices(updatedInvoices);
    }

    // Record automatically to ledger transaction
    const newTx: Transaction = {
      id: `tx_auto_${Date.now()}`,
      deptId: newReceipt.deptId,
      transactionType: newReceipt.type === 'incoming' ? 'income' : 'expense',
      category: newReceipt.type === 'incoming' ? 'Client Bill Collection' : 'Vendor Payment Disbursement',
      amount: newReceipt.amount,
      date: newReceipt.paymentDate,
      payeeOrPayer: newReceipt.clientOrVendorName,
      referenceNo: newReceipt.receiptNo,
      receiptId: newReceipt.id,
      notes: newReceipt.notes,
      status: 'verified',
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setTransactions([newTx, ...transactions]);

    showToast(`Payment receipt ${newReceipt.receiptNo} recorded!`);
  };

  const handleDeleteReceipt = (receiptId: string) => {
    if (confirm('Delete receipt record?')) {
      setReceipts(receipts.filter((r) => r.id !== receiptId));
      showToast('Receipt record deleted.', 'info');
    }
  };

  // Transaction Handlers
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
    <div className="min-h-screen bg-black text-white font-sans selection:bg-emerald-600 selection:text-white">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 flex items-center space-x-2.5 bg-zinc-900 border border-emerald-500/60 text-white px-4 py-2.5 rounded-xl shadow-2xl animate-fade-in text-xs font-bold">
          <CheckCircle className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main App Navigation Header */}
      <Header
        currentUser={currentUser}
        companySettings={companySettings}
        activeDeptId={activeDeptId}
        onSelectDepartment={handleSelectDepartment}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main View Area */}
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
              setIsInvoiceModalOpen(true);
            }}
            onOpenCreateQuotation={() => {
              setEditingQuotation(null);
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
              setIsQuotationModalOpen(true);
            }}
            onOpenEditQuotation={(q) => {
              setEditingQuotation(q);
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
              setIsInvoiceModalOpen(true);
            }}
            onOpenEditInvoice={(inv) => {
              setEditingInvoice(inv);
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
              setIsReceiptModalOpen(true);
            }}
            onOpenCreateReceipt={() => {
              setReceiptInvoice(null);
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
      />

      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        onSave={handleSaveInvoice}
        initialData={editingInvoice}
        defaultDeptId={activeDeptId}
        companySettings={companySettings}
      />

      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        onSave={handleSaveReceipt}
        defaultDeptId={activeDeptId}
        initialInvoice={receiptInvoice}
        companySettings={companySettings}
      />

      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        onSave={handleSaveTransaction}
        defaultDeptId={activeDeptId}
        companySettings={companySettings}
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
