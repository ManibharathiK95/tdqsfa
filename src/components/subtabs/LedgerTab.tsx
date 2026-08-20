import React, { useState, useMemo } from 'react';
import type { DepartmentId, Quotation, Invoice, Receipt, CompanySettings } from '../../types';
import { Filter, Plus, Save, X } from 'lucide-react';

interface LedgerTabProps {
  deptId: DepartmentId;
  quotations: Quotation[];
  invoices: Invoice[];
  receipts: Receipt[];
  companySettings: CompanySettings;
  onSavePurchaseOrder: (quotationId: string, poNo: string, poDate: string) => void;
}

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-';
  const p = dateStr.split('-');
  if (p.length === 3) return `${p[2]}-${p[1]}-${p[0]}`;
  return dateStr;
};

const getRootNo = (no: string): string => no.replace(/\.\d+$/, '');

const statusStyle = (s: string): string => {
  switch (s) {
    case 'approved': case 'paid': case 'cleared':
      return 'bg-emerald-900/50 text-emerald-400 border-emerald-700';
    case 'sent': case 'pending':
      return 'bg-amber-900/50 text-amber-400 border-amber-700';
    case 'modified': case 'partial':
      return 'bg-blue-900/50 text-blue-400 border-blue-700';
    case 'rejected': case 'overdue':
      return 'bg-red-900/50 text-red-400 border-red-700';
    default:
      return 'bg-zinc-800 text-zinc-400 border-zinc-600';
  }
};

interface LedgerGroup {
  quote: Quotation | null;
  invoices: Invoice[];
  groupName: string;
}

export const LedgerTab: React.FC<LedgerTabProps> = ({
  deptId,
  quotations,
  invoices,
  receipts,
  companySettings,
  onSavePurchaseOrder,
}) => {
  const [selectedContractor, setSelectedContractor] = useState<string>('all');
  const [editingPO, setEditingPO] = useState<string | null>(null);
  const [poNo, setPoNo] = useState('');
  const [poDate, setPoDate] = useState('');

  const fmt = (amount: number): string =>
    `${companySettings.currencySymbol || 'AED'} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const contractors = useMemo(() => {
    const names = new Set<string>();
    quotations.filter(q => q.deptId === deptId && q.status !== 'voided').forEach(q => names.add(q.clientName));
    const qIds = new Set(quotations.filter(q => q.deptId === deptId).map(q => q.id));
    invoices.filter(i => i.deptId === deptId && (!i.quotationId || !qIds.has(i.quotationId))).forEach(i => names.add(i.clientName));
    return Array.from(names).sort();
  }, [quotations, invoices, deptId]);

  const groups = useMemo((): LedgerGroup[] => {
    const dq = quotations.filter(q => q.deptId === deptId);
    const di = invoices.filter(i => i.deptId === deptId);
    const latest = new Map<string, Quotation>();
    for (const q of dq) {
      const root = getRootNo(q.quotationNo);
      const ex = latest.get(root);
      if (!ex) {
        latest.set(root, q);
      } else if (q.status !== 'voided' && (ex.status === 'voided' ||
        (q.quotationNo.includes('.') && !ex.quotationNo.includes('.')) ||
        (q.quotationNo.includes('.') && ex.quotationNo.includes('.') &&
          parseInt(q.quotationNo.split('.').pop()!) > parseInt(ex.quotationNo.split('.').pop()!))
      )) {
        latest.set(root, q);
      }
    }
    const result: LedgerGroup[] = [];
    const usedInvIds = new Set<string>();
    for (const [, quote] of latest) {
      if (quote.status === 'voided') continue;
      const verIds = new Set(dq.filter(q => getRootNo(q.quotationNo) === getRootNo(quote.quotationNo)).map(q => q.id));
      const linked = di.filter(i => i.quotationId && verIds.has(i.quotationId));
      linked.forEach(i => usedInvIds.add(i.id));
      result.push({ quote, invoices: linked, groupName: quote.clientName });
    }
    const direct = di.filter(i => !i.quotationId || !usedInvIds.has(i.id));
    if (direct.length > 0) {
      const map = new Map<string, Invoice[]>();
      for (const inv of direct) {
        const key = inv.clientName || 'Unknown';
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(inv);
      }
      for (const [client, invs] of map) {
        result.push({ quote: null, invoices: invs, groupName: client });
      }
    }
    return result;
  }, [quotations, invoices, deptId]);

  const filtered = useMemo(() => {
    if (selectedContractor === 'all') return groups;
    return groups.filter(g => g.groupName === selectedContractor);
  }, [groups, selectedContractor]);

  const getRcpts = (inv: Invoice): Receipt[] =>
    receipts.filter(r => r.invoiceNo === inv.invoiceNo || r.invoiceNo === inv.id);

  const handleSavePO = () => {
    if (editingPO && poNo.trim()) {
      onSavePurchaseOrder(editingPO, poNo.trim(), poDate);
      setEditingPO(null);
      setPoNo('');
      setPoDate('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center space-x-3">
        <Filter className="w-4 h-4 text-zinc-400" />
        <select
          value={selectedContractor}
          onChange={(e) => setSelectedContractor(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="all">All Contractors</option>
          {contractors.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <span className="text-xs text-zinc-500">{filtered.length} project{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left text-[10px] font-bold uppercase text-zinc-500 tracking-wider px-4 py-3">Invoice Date</th>
                <th className="text-left text-[10px] font-bold uppercase text-zinc-500 tracking-wider px-4 py-3">Invoice No</th>
                <th className="text-left text-[10px] font-bold uppercase text-zinc-500 tracking-wider px-4 py-3">Status / Amount</th>
                <th className="text-left text-[10px] font-bold uppercase text-zinc-500 tracking-wider px-4 py-3">Receipt Date</th>
                <th className="text-left text-[10px] font-bold uppercase text-zinc-500 tracking-wider px-4 py-3">Receipt / Amount</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="text-center text-zinc-600 py-16 text-sm">No records found</td></tr>
              )}

              {filtered.map((group, gIdx) => (
                <React.Fragment key={`g-${gIdx}`}>

                  {/* ── Quote + PO Header ── */}
                  <tr className="border-b border-zinc-800 bg-zinc-800/30">
                    <td colSpan={5} className="px-4 py-3">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-wrap">
                          {group.quote ? (
                            <>
                              <span className="font-mono text-sm font-bold text-emerald-400 whitespace-nowrap">{group.quote.quotationNo}</span>
                              <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border whitespace-nowrap ${statusStyle(group.quote.status)}`}>{group.quote.status}</span>
                              <span className="text-sm font-semibold text-zinc-200 whitespace-nowrap">{fmt(group.quote.totalAmount)}</span>
                            </>
                          ) : (
                            <span className="text-sm text-zinc-500 italic">Direct Invoice — {group.groupName}</span>
                          )}
                        </div>
                        <div className="flex items-center shrink-0">
                          {group.quote?.purchaseOrderNo ? (
                            <span className="text-sm text-zinc-400 whitespace-nowrap">
                              PO: <span className="font-mono font-bold text-zinc-200">{group.quote.purchaseOrderNo}</span>
                              {group.quote.purchaseOrderDate && <span className="text-zinc-500 ml-1.5">{formatDate(group.quote.purchaseOrderDate)}</span>}
                            </span>
                          ) : group.quote ? (
                            editingPO === group.quote.id ? (
                              <div className="flex items-center gap-1.5">
                                <input type="text" placeholder="PO Number" value={poNo} onChange={(e) => setPoNo(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSavePO()} className="bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs rounded-lg px-2.5 py-1.5 w-32 focus:ring-1 focus:ring-emerald-500 outline-none" autoFocus />
                                <input type="date" value={poDate} onChange={(e) => setPoDate(e.target.value)} className="bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none" />
                                <button onClick={handleSavePO} className="p-1.5 bg-emerald-700 hover:bg-emerald-600 rounded-lg text-white transition-colors"><Save className="w-3.5 h-3.5" /></button>
                                <button onClick={() => { setEditingPO(null); setPoNo(''); setPoDate(''); }} className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400 transition-colors"><X className="w-3.5 h-3.5" /></button>
                              </div>
                            ) : (
                              <button onClick={() => setEditingPO(group.quote!.id)} className="flex items-center gap-1 text-xs text-zinc-500 hover:text-emerald-400 transition-colors px-2 py-1 rounded-lg hover:bg-zinc-800">
                                <Plus className="w-3.5 h-3.5" /><span>Add PO</span>
                              </button>
                            )
                          ) : null}
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* ── Invoice Sub-rows ── */}
                  {group.invoices.length > 0 ? group.invoices.map((inv) => {
                    const rcpts = getRcpts(inv);
                    const rows = Math.max(1, rcpts.length);
                    return Array.from({ length: rows }, (_, rIdx) => (
                      <tr key={`${inv.id}-${rIdx}`} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                        <td className="px-4 py-2.5 text-sm text-zinc-400 font-mono align-top">
                          {rIdx === 0 ? formatDate(inv.issueDate) : ''}
                        </td>
                        <td className="px-4 py-2.5 text-sm font-mono font-bold text-zinc-200 align-top">
                          {rIdx === 0 ? inv.invoiceNo : ''}
                        </td>
                        <td className="px-4 py-2.5 align-top">
                          {rIdx === 0 ? (
                            <div>
                              <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border inline-block ${statusStyle(inv.status)}`}>{inv.status}</span>
                              <div className="text-sm font-mono text-zinc-300 mt-1.5">{fmt(inv.totalAmount)}</div>
                            </div>
                          ) : ''}
                        </td>
                        <td className="px-4 py-2.5 text-sm text-zinc-400 font-mono align-top">
                          {rcpts[rIdx] ? formatDate(rcpts[rIdx].paymentDate) : ''}
                        </td>
                        <td className="px-4 py-2.5 align-top">
                          {rcpts[rIdx] ? (
                            <div>
                              <span className="text-sm font-mono font-semibold text-zinc-200">{rcpts[rIdx].receiptNo}</span>
                              <div className="text-sm font-mono text-emerald-400 mt-0.5">{fmt(rcpts[rIdx].amount)}</div>
                            </div>
                          ) : rIdx === 0 ? (
                            <span className="text-sm text-zinc-700">—</span>
                          ) : ''}
                        </td>
                      </tr>
                    ));
                  }) : (
                    <tr className="border-b border-zinc-800/50">
                      <td colSpan={5} className="px-4 py-3 text-center text-sm text-zinc-600">No invoices yet</td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
