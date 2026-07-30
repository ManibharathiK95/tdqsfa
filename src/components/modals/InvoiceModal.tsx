import React, { useState, useEffect } from 'react';
import { Invoice, DepartmentId, LineItem, InvoiceStatus, CompanySettings } from '../../types';
import { DEPARTMENTS } from '../../data/initialData';
import { formatCurrency } from '../../utils/export';
import { X, CheckSquare, Plus, Trash2 } from 'lucide-react';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (invoice: Partial<Invoice>) => void;
  initialData?: Invoice | null;
  defaultDeptId?: DepartmentId;
  companySettings: CompanySettings;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  defaultDeptId = 'design',
  companySettings,
}) => {
  const [deptId, setDeptId] = useState<DepartmentId>(defaultDeptId === 'all' ? 'design' : defaultDeptId);
  const [invoiceNo, setInvoiceNo] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<InvoiceStatus>('pending');
  const [taxRate, setTaxRate] = useState<number>(companySettings.defaultTaxRate || 5);
  const [discount, setDiscount] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');

  const [items, setItems] = useState<LineItem[]>([
    {
      id: 'item_inv_1',
      description: 'Engineering & Detailing Services Invoice',
      quantity: 1,
      unit: 'Lump Sum',
      unitPrice: 10000,
      amount: 10000,
    },
  ]);

  useEffect(() => {
    if (initialData) {
      setDeptId(initialData.deptId);
      setInvoiceNo(initialData.invoiceNo);
      setClientName(initialData.clientName);
      setClientEmail(initialData.clientEmail);
      setProjectTitle(initialData.projectTitle);
      setIssueDate(initialData.issueDate);
      setDueDate(initialData.dueDate);
      setStatus(initialData.status);
      setTaxRate(initialData.taxRate);
      setDiscount(initialData.discount);
      setPaidAmount(initialData.paidAmount || 0);
      setNotes(initialData.notes || '');
      setPaymentTerms(initialData.paymentTerms || '');
      setItems(initialData.items && initialData.items.length > 0 ? initialData.items : []);
    } else {
      const selectedDept = defaultDeptId === 'all' ? 'design' : defaultDeptId;
      setDeptId(selectedDept);
      setInvoiceNo(`INV-${selectedDept.toUpperCase()}-2026-${Math.floor(100 + Math.random() * 900)}`);
      setClientName('');
      setClientEmail('');
      setProjectTitle('');
      setIssueDate(new Date().toISOString().slice(0, 10));

      const due = new Date();
      due.setDate(due.getDate() + 30);
      setDueDate(due.toISOString().slice(0, 10));

      setStatus('pending');
      setTaxRate(companySettings.defaultTaxRate || 5);
      setDiscount(0);
      setPaidAmount(0);
      setNotes('Payment payable to TDQS Engineering & Cost Consultancy.');
      setPaymentTerms('Net 30 Days. Late payments subject to 1.5% interest per month.');
      setItems([
        {
          id: `li_inv_${Date.now()}`,
          description: 'Engineering Design & Shop Drawing Package',
          quantity: 1,
          unit: 'Package',
          unitPrice: 12000,
          amount: 12000,
        },
      ]);
    }
  }, [initialData, defaultDeptId, isOpen, companySettings]);

  if (!isOpen) return null;

  const handleItemChange = (index: number, field: keyof LineItem, val: any) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: val };
    if (field === 'quantity' || field === 'unitPrice') {
      item.amount = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
    }
    updated[index] = item;
    setItems(updated);
  };

  const addItemRow = () => {
    setItems([
      ...items,
      {
        id: `li_inv_${Date.now()}_${items.length}`,
        description: '',
        quantity: 1,
        unit: 'Units',
        unitPrice: 0,
        amount: 0,
      },
    ]);
  };

  const removeItemRow = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((acc, item) => acc + (item.amount || 0), 0);
  const taxAmount = (subtotal * (taxRate || 0)) / 100;
  const totalAmount = Math.max(0, subtotal + taxAmount - (discount || 0));
  const balanceDue = Math.max(0, totalAmount - (paidAmount || 0));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle.trim() || !clientName.trim()) return;

    let computedStatus: InvoiceStatus = status;
    if (paidAmount >= totalAmount && totalAmount > 0) {
      computedStatus = 'paid';
    } else if (paidAmount > 0 && paidAmount < totalAmount) {
      computedStatus = 'partial';
    }

    onSave({
      id: initialData ? initialData.id : `inv_${Date.now()}`,
      invoiceNo,
      deptId,
      quotationId: initialData?.quotationId,
      clientName,
      clientEmail,
      projectTitle,
      issueDate,
      dueDate,
      status: computedStatus,
      items,
      subtotal,
      taxRate,
      taxAmount,
      discount,
      totalAmount,
      paidAmount,
      balanceDue,
      notes,
      paymentTerms,
      createdAt: initialData ? initialData.createdAt : new Date().toISOString().slice(0, 10),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl p-6 relative my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <CheckSquare className="w-5 h-5 text-indigo-400" />
            <span>{initialData ? 'Edit Official Invoice' : 'Create Official Invoice'}</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Department</label>
              <select
                value={deptId}
                onChange={(e) => setDeptId(e.target.value as DepartmentId)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Invoice Number</label>
              <input
                type="text"
                required
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
                <option value="overdue">Overdue</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Client / Company Name *</label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Metro Transit Infra Corp"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Client Email</label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="accounts@metro.com"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Project Title / Billing Description *</label>
            <input
              type="text"
              required
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              placeholder="e.g. Overpass Bridge Structural Design - Milestone 1"
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Issue Date</label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase text-indigo-400 tracking-wider">
                Invoice Line Items
              </label>
              <button
                type="button"
                onClick={addItemRow}
                className="flex items-center space-x-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-950/40 border border-indigo-800 px-2.5 py-1 rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item Line</span>
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="grid grid-cols-12 gap-2 items-center bg-slate-950 border border-slate-800 p-2.5 rounded-xl"
                >
                  <div className="col-span-5">
                    <input
                      type="text"
                      placeholder="Item description"
                      value={item.description}
                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                    />
                  </div>

                  <div className="col-span-2">
                    <input
                      type="number"
                      placeholder="Qty"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white text-right"
                    />
                  </div>

                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="Unit"
                      value={item.unit}
                      onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-white"
                    />
                  </div>

                  <div className="col-span-2">
                    <input
                      type="number"
                      placeholder="Price"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-white text-right font-mono"
                    />
                  </div>

                  <div className="col-span-1 text-center">
                    <button
                      type="button"
                      onClick={() => removeItemRow(idx)}
                      className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subtotal, Tax, Payments */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Subtotal:</span>
              <span className="font-mono text-white font-bold">{formatCurrency(subtotal, companySettings)}</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-slate-400">Tax Rate (%):</span>
                <input
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  className="w-16 bg-slate-900 border border-slate-800 text-white rounded px-2 py-0.5 text-right font-mono"
                />
              </div>
              <span className="font-mono text-slate-300">+{formatCurrency(taxAmount, companySettings)}</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-slate-400">Paid Amount ({companySettings.currencySymbol}):</span>
                <input
                  type="number"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                  className="w-24 bg-slate-900 border border-slate-800 text-white rounded px-2 py-0.5 text-right font-mono text-emerald-400 font-bold"
                />
              </div>
              <span className="font-mono text-emerald-400 font-bold">-{formatCurrency(paidAmount, companySettings)}</span>
            </div>

            <div className="flex justify-between items-center text-sm font-bold pt-2 border-t border-slate-800 text-white">
              <span>Balance Due:</span>
              <span className="text-amber-400 text-base">{formatCurrency(balanceDue, companySettings)}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md"
            >
              {initialData ? 'Update Invoice' : 'Save Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
