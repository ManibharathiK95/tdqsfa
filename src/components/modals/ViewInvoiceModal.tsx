import React from 'react';
import { Invoice, Quotation, CompanySettings } from '../../types';
import { formatCurrency } from '../../utils/export';
import { CompanyLogo } from '../CompanyLogo';
import { X, Printer } from 'lucide-react';

interface ViewInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Invoice | Quotation | null;
  type: 'invoice' | 'quotation';
  companySettings: CompanySettings;
}

export const ViewInvoiceModal: React.FC<ViewInvoiceModalProps> = ({
  isOpen,
  onClose,
  document: doc,
  type,
  companySettings,
}) => {
  if (!isOpen || !doc) return null;

  const isInvoice = type === 'invoice';
  const inv = isInvoice ? (doc as Invoice) : null;
  const quot = !isInvoice ? (doc as Quotation) : null;

  const docNo = isInvoice ? inv!.invoiceNo : quot!.quotationNo;
  const clientName = isInvoice ? inv!.clientName : quot!.clientName;
  const clientEmail = isInvoice ? inv!.clientEmail : quot!.clientEmail;
  const projectTitle = isInvoice ? inv!.projectTitle : quot!.projectTitle;
  const primaryDate = isInvoice ? inv!.issueDate : quot!.date;
  const secondaryDate = isInvoice ? inv!.dueDate : quot!.validUntil;

  const hasBankDetails = !!(companySettings.bankName && companySettings.iban);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-2xl shadow-2xl p-6 relative my-8 text-white">
        {/* Top Control Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800 print:hidden">
          <div className="flex items-center space-x-2">
            <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-0.5 rounded-full text-xs font-mono uppercase font-bold">
              {type} preview
            </span>
            <span className="text-xs text-zinc-300 font-mono font-bold">{docNo}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Export PDF</span>
            </button>
            <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="bg-white text-zinc-900 p-8 rounded-xl mt-4 shadow-xl font-sans text-xs space-y-6 border border-zinc-200">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-zinc-200 pb-6">
            <div>
              <div className="flex items-center space-x-3">
                <CompanyLogo size="lg" />
                <div>
                  <h2 className="text-lg font-extrabold text-zinc-900 leading-tight">
                    {companySettings.companyName || 'Thulir Design & QS Services FZE'}
                  </h2>
                  <p className="text-[11px] font-medium text-emerald-800">{companySettings.tagline}</p>
                </div>
              </div>
              <p className="text-[10px] text-zinc-600 mt-2">{companySettings.address}</p>
              <p className="text-[10px] text-zinc-600">{companySettings.email} • Tax ID: {companySettings.taxId}</p>
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-black uppercase tracking-wider text-emerald-950">
                {isInvoice ? 'INVOICE' : 'ESTIMATE'}
              </h1>
              <p className="font-mono text-sm font-extrabold text-emerald-700 mt-1">#{docNo}</p>
              <div className="mt-2 text-[10px] text-zinc-600 space-y-0.5">
                <p><span className="font-bold">{isInvoice ? 'Issue Date:' : 'Date:'}</span> {primaryDate}</p>
                <p><span className="font-bold">{isInvoice ? 'Due Date:' : 'Valid Until:'}</span> {secondaryDate}</p>
              </div>
            </div>
          </div>

          {/* Client & Project */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Billed To:</p>
              <p className="font-bold text-sm text-slate-900 mt-1">{clientName}</p>
              <p className="text-slate-600">{clientEmail}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Project / Scope:</p>
              <p className="font-bold text-slate-900 mt-1">{projectTitle}</p>
              <p className="text-slate-500 capitalize">Department: {doc.deptId}</p>
            </div>
          </div>

          {/* Line Items */}
          <div>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b-2 border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                  <th className="py-2 px-1">#</th>
                  <th className="py-2 px-2">Description</th>
                  <th className="py-2 px-2 text-right">Qty</th>
                  <th className="py-2 px-2 text-right">Unit Rate</th>
                  <th className="py-2 px-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {doc.items.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td className="py-2.5 px-1 font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-2.5 px-2 font-medium text-slate-900">{item.description}</td>
                    <td className="py-2.5 px-2 text-right font-mono">{item.quantity} {item.unit}</td>
                    <td className="py-2.5 px-2 text-right font-mono">{formatCurrency(item.unitPrice, companySettings)}</td>
                    <td className="py-2.5 px-2 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(item.amount, companySettings)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end pt-4 border-t border-slate-200">
            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono">{formatCurrency(doc.subtotal, companySettings)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax ({doc.taxRate}%):</span>
                <span className="font-mono">+{formatCurrency(doc.taxAmount, companySettings)}</span>
              </div>
              {doc.discount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Discount:</span>
                  <span className="font-mono">-{formatCurrency(doc.discount, companySettings)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-300 pt-2">
                <span>Total Amount:</span>
                <span className="text-indigo-900 font-mono text-base">
                  {formatCurrency(doc.totalAmount, companySettings)}
                </span>
              </div>
              {isInvoice && (
                <>
                  <div className="flex justify-between text-slate-600 pt-1">
                    <span>Amount Paid:</span>
                    <span className="font-mono text-emerald-600 font-bold">
                      {formatCurrency(inv!.paidAmount || 0, companySettings)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-amber-700 bg-amber-50 p-2 rounded border border-amber-200 mt-1">
                    <span>Balance Due:</span>
                    <span className="font-mono">{formatCurrency(inv!.balanceDue, companySettings)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Bank Details on Print */}
          {hasBankDetails && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider mb-2">Bank Details (for AED B2B Transfer)</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[11px]">
                <div className="flex justify-between"><span className="text-slate-500">Bank:</span><span className="text-slate-900 font-semibold">{companySettings.bankName}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Account:</span><span className="text-slate-900 font-mono">{companySettings.accountNumber}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">IBAN:</span><span className="text-slate-900 font-mono">{companySettings.iban}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">SWIFT:</span><span className="text-slate-900 font-mono">{companySettings.swiftCode}</span></div>
              </div>
            </div>
          )}

          {/* Footer Terms */}
          <div className="border-t border-slate-200 pt-4 text-[10px] text-slate-500 space-y-1">
            <p className="font-bold text-slate-700">Notes & Terms:</p>
            <p>{doc.notes || 'Thank you for your business.'}</p>
            {isInvoice && <p>{inv!.paymentTerms}</p>}
            {!isInvoice && <p>{quot!.terms}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};
