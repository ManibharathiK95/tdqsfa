import React from 'react';
import { Receipt, Invoice, CompanySettings } from '../../types';
import { formatCurrency } from '../../utils/export';
import { CompanyLogo } from '../CompanyLogo';
import { X, Printer } from 'lucide-react';

interface ViewReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: Receipt | null;
  invoices: Invoice[];
  companySettings: CompanySettings;
}

export const ViewReceiptModal: React.FC<ViewReceiptModalProps> = ({
  isOpen, onClose, receipt, invoices, companySettings,
}) => {
  if (!isOpen || !receipt) return null;

  const linkedInvoice = receipt.invoiceNo
    ? invoices.find((inv) => inv.invoiceNo === receipt.invoiceNo || inv.id === receipt.invoiceNo)
    : null;

  const invoiceTotal = linkedInvoice ? linkedInvoice.totalAmount : 0;
  const balanceAfterPayment = linkedInvoice
    ? Math.max(0, linkedInvoice.totalAmount - (linkedInvoice.paidAmount || 0))
    : 0;

  const hasBankDetails = !!(companySettings.bankName && companySettings.iban);

  const disclaimer = 'This is a system-generated Payment Receipt from Thulir Design & QS Services FZE. It is valid without a physical signature or company stamp.';

  const handlePrint = () => window.print();

  const paymentModeLabel: Record<string, string> = {
    bank_transfer: 'Bank Wire Transfer',
    cheque: 'Cheque',
    cash: 'Cash',
    online: 'Online Payment',
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-[220mm] shadow-2xl p-4 relative my-6 text-white print-hide">
        {/* Controls */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center space-x-2">
            <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-0.5 rounded-full text-xs font-mono uppercase font-bold">receipt</span>
            <span className="text-xs text-zinc-300 font-mono font-bold whitespace-nowrap">{receipt.receiptNo}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={handlePrint} className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow transition-all">
              <Printer className="w-4 h-4" /><span>Print / PDF</span>
            </button>
            <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
          </div>
        </div>

        {/* A4 Paper Preview */}
        <div className="a4-print-area rounded-lg border border-zinc-200 shadow-lg mt-3 text-zinc-900 font-sans text-[11px] p-7 space-y-4">

          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-zinc-300 pb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <CompanyLogo size="lg" />
                <div>
                  <h2 className="text-base font-extrabold text-zinc-900 leading-tight">{companySettings.companyName}</h2>
                  <p className="text-[10px] font-medium text-emerald-800">{companySettings.tagline}</p>
                </div>
              </div>
              <p className="text-[9px] text-zinc-500 mt-1.5">{companySettings.address}</p>
              <p className="text-[9px] text-zinc-500">{companySettings.email} • Tax ID: {companySettings.taxId}</p>
            </div>
            <div className="text-right ml-4 shrink-0">
              <h1 className="text-xl font-black uppercase tracking-wider text-emerald-950">PAYMENT RECEIPT</h1>
              <p className="font-mono text-sm font-extrabold text-emerald-700 mt-0.5 whitespace-nowrap">#{receipt.receiptNo}</p>
              <div className="mt-1.5 text-[9px] text-zinc-500">
                <p><span className="font-bold">Payment Date:</span> {receipt.paymentDate}</p>
                <p><span className="font-bold">Status:</span> <span className="uppercase font-bold text-emerald-700">{receipt.status}</span></p>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <p className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">{receipt.type === 'incoming' ? 'Received From:' : 'Paid To:'}</p>
              <p className="font-bold text-sm text-slate-900 mt-0.5">{receipt.clientOrVendorName}</p>
              {linkedInvoice && (
                <p className="text-slate-500 text-[10px] mt-0.5">Invoice: <span className="font-mono whitespace-nowrap">{linkedInvoice.invoiceNo}</span></p>
              )}
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Payment Details</p>
              <div className="mt-0.5 space-y-0.5 text-slate-700 text-[10px]">
                <p><span className="font-semibold">Mode:</span> {paymentModeLabel[receipt.paymentMode] || receipt.paymentMode}</p>
                <p><span className="font-semibold">Reference:</span> <span className="font-mono">{receipt.referenceNo}</span></p>
                <p><span className="font-semibold">Type:</span> <span className="uppercase">{receipt.type}</span></p>
              </div>
            </div>
          </div>

          {/* Amount + Balance */}
          <div className="bg-slate-50 border-2 border-slate-300 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-700 text-sm">Amount {receipt.type === 'incoming' ? 'Received' : 'Paid'}:</span>
              <span className={`font-mono font-black text-xl ${receipt.type === 'incoming' ? 'text-emerald-700' : 'text-rose-700'}`}>
                {formatCurrency(receipt.amount, companySettings)}
              </span>
            </div>

            {linkedInvoice && (
              <>
                <div className="flex justify-between items-center text-[11px] mt-2.5 pt-2.5 border-t border-slate-200">
                  <span className="text-slate-500">Invoice Total:</span>
                  <span className="font-mono font
