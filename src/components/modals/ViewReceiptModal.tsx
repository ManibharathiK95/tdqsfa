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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-2xl shadow-2xl p-6 relative my-8 text-white">
        {/* Controls */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800 print-hide">
          <div className="flex items-center space-x-2">
            <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-0.5 rounded-full text-xs font-mono uppercase font-bold">receipt</span>
            <span className="text-xs text-zinc-300 font-mono font-bold">{receipt.receiptNo}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={handlePrint} className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow transition-all">
              <Printer className="w-4 h-4" /><span>Print / PDF</span>
            </button>
            <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
          </div>
        </div>

        {/* ★ A4 Print Area ★ */}
        <div className="a4-print-area bg-white text-zinc-900 p-8 rounded-xl mt-4 shadow-xl font-sans text-xs space-y-5 border border-zinc-200">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-zinc-300 pb-5">
            <div>
              <div className="flex items-center space-x-3">
                <CompanyLogo size="lg" />
                <div>
                  <h2 className="text-lg font-extrabold text-zinc-900 leading-tight">{companySettings.companyName}</h2>
                  <p className="text-[11px] font-medium text-emerald-800">{companySettings.tagline}</p>
                </div>
              </div>
              <p className="text-[10px] text-zinc-500 mt-2">{companySettings.address}</p>
              <p className="text-[10px] text-zinc-500">{companySettings.email} • Tax ID: {companySettings.taxId}</p>
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-black uppercase tracking-wider text-emerald-950">PAYMENT RECEIPT</h1>
              <p className="font-mono text-sm font-extrabold text-emerald-700 mt-1">#{receipt.receiptNo}</p>
              <div className="mt-2 text-[10px] text-zinc-500">
                <p><span className="font-bold">Payment Date:</span> {receipt.paymentDate}</p>
                <p><span className="font-bold">Status:</span> <span className="uppercase font-bold text-emerald-700">{receipt.status}</span></p>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">{receipt.type === 'incoming' ? 'Received From:' : 'Paid To:'}</p>
              <p className="font-bold text-sm text-slate-900 mt-1">{receipt.clientOrVendorName}</p>
              {linkedInvoice && (
                <p className="text-slate-500 mt-0.5">Invoice: {linkedInvoice.invoiceNo}</p>
              )}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Payment Details</p>
              <div className="mt-1 space-y-0.5 text-slate-700">
                <p><span className="font-semibold">Mode:</span> {paymentModeLabel[receipt.paymentMode] || receipt.paymentMode}</p>
                <p><span className="font-semibold">Reference:</span> <span className="font-mono">{receipt.referenceNo}</span></p>
                <p><span className="font-semibold">Type:</span> <span className="uppercase">{receipt.type}</span></p>
              </div>
            </div>
          </div>

          {/* Amount Paid + Balance Due */}
          <div className="bg-slate-50 border-2 border-slate-300 rounded-lg p-5">
            <div className="flex justify-between items-center text-base">
              <span className="font-bold text-slate-700">Amount {receipt.type === 'incoming' ? 'Received' : 'Paid'}:</span>
              <span className={`font-mono font-black text-xl ${receipt.type === 'incoming' ? 'text-emerald-700' : 'text-rose-700'}`}>
                {formatCurrency(receipt.amount, companySettings)}
              </span>
            </div>

            {linkedInvoice && (
              <>
                <div className="flex justify-between items-center text-xs mt-3 pt-3 border-t border-slate-200">
                  <span className="text-slate-500">Invoice Total Amount:</span>
                  <span className="font-mono font-bold text-slate-700">{formatCurrency(invoiceTotal, companySettings)}</span>
                </div>
                <div className="flex justify-between items-center text-xs mt-1.5">
                  <span className="text-slate-500">Total Paid on Invoice:</span>
                  <span className="font-mono font-bold text-emerald-700">{formatCurrency(linkedInvoice.paidAmount || 0, companySettings)}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold mt-2 pt-2 border-t-2 border-slate-300">
                  <span className="text-slate-800">Balance Due on Invoice:</span>
                  <span className={`font-mono text-base ${balanceAfterPayment > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                    {formatCurrency(balanceAfterPayment, companySettings)}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Bank Details */}
          {hasBankDetails && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider mb-2">Bank Details (AED B2B Transfer)</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[11px]">
                <div className="flex justify-between"><span className="text-slate-500">Bank:</span><span className="text-slate-900 font-semibold">{companySettings.bankName}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Account:</span><span className="text-slate-900 font-mono">{companySettings.accountNumber}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">IBAN:</span><span className="text-slate-900 font-mono">{companySettings.iban}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">SWIFT:</span><span className="text-slate-900 font-mono">{companySettings.swiftCode}</span></div>
              </div>
            </div>
          )}

          {/* Notes */}
          {receipt.notes && (
            <div className="border-t border-slate-200 pt-3 text-[10px] text-slate-500">
              <p className="font-bold text-slate-700">Notes:</p>
              <p>{receipt.notes}</p>
            </div>
          )}

          {/* ★ Official Disclaimer ★ */}
          <div className="border-t border-slate-300 pt-4 text-center">
            <p className="text-[10px] font-semibold text-slate-400 italic">{disclaimer}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
