import React, { useState } from 'react';
import { VendorContractor, DepartmentId, CompanySettings } from '../../types';
import { formatCurrency, downloadCSV } from '../../utils/export';
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Phone,
  Mail,
  Building,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface VendorsContractorsTabProps {
  deptId: DepartmentId;
  vendors: VendorContractor[];
  companySettings: CompanySettings;
  canEdit: boolean;
  onOpenCreateVendor: () => void;
  onOpenEditVendor: (vendor: VendorContractor) => void;
  onDeleteVendor: (vendorId: string) => void;
}

export const VendorsContractorsTab: React.FC<VendorsContractorsTabProps> = ({
  deptId,
  vendors,
  companySettings,
  canEdit,
  onOpenCreateVendor,
  onOpenEditVendor,
  onDeleteVendor,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'contractor' | 'vendor' | 'subcontractor'>('all');

  // Filter list
  const filteredVendors = vendors.filter((v) => {
    const matchesDept = deptId === 'all' || v.deptId === deptId;
    const matchesSearch =
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || v.type === typeFilter;
    return matchesDept && matchesSearch && matchesType;
  });

  const handleExportCSV = () => {
    const rows = [
      ['Vendor Code', 'Name', 'Type', 'Category', 'Contact Person', 'Email', 'Phone', 'Total Billed', 'Total Paid', 'Balance Due', 'Status'],
      ...filteredVendors.map((v) => [
        v.code,
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
    downloadCSV(`vendors_contractors_${deptId}_${new Date().toISOString().slice(0, 10)}`, rows);
  };

  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search vendors, contractors, contact person, or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        {/* Type Filter & Action Buttons */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 p-1 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            {(['all', 'contractor', 'vendor', 'subcontractor'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-2.5 py-1 rounded-lg font-medium text-[11px] capitalize transition-all ${
                  typeFilter === t
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all"
            title="Export CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">Export CSV</span>
          </button>

          {canEdit && (
            <button
              onClick={onOpenCreateVendor}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Contractor / Vendor</span>
            </button>
          )}
        </div>
      </div>

      {/* Vendors Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                <th className="py-3.5 px-4">Vendor Code & Name</th>
                <th className="py-3.5 px-4">Type & Category</th>
                <th className="py-3.5 px-4">Contact Person</th>
                <th className="py-3.5 px-4 text-right">Total Billed</th>
                <th className="py-3.5 px-4 text-right">Total Paid</th>
                <th className="py-3.5 px-4 text-right">Balance Due</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                {canEdit && <th className="py-3.5 px-4 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 8 : 7} className="text-center py-10 text-slate-500">
                    No contractors or vendors found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredVendors.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-white">
                      <div className="font-bold text-slate-100">{v.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono flex items-center space-x-1">
                        <span>{v.code}</span>
                        <span>•</span>
                        <span className="uppercase text-indigo-400">{v.deptId}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 border border-slate-700 text-indigo-300 capitalize">
                        {v.type}
                      </span>
                      <div className="text-[11px] text-slate-400 mt-0.5">{v.category}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-200">{v.contactPerson}</div>
                      <div className="text-[10px] text-slate-400 flex items-center space-x-2 mt-0.5">
                        <span className="flex items-center space-x-1">
                          <Mail className="w-3 h-3 text-slate-500" />
                          <span>{v.email}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-slate-500" />
                          <span>{v.phone}</span>
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium">
                      {formatCurrency(v.totalBilled, companySettings)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-400">
                      {formatCurrency(v.totalPaid, companySettings)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-amber-400">
                      {formatCurrency(v.balanceDue, companySettings)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          v.status === 'active'
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {v.status === 'active' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        <span className="capitalize">{v.status}</span>
                      </span>
                    </td>
                    {canEdit && (
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => onOpenEditVendor(v)}
                            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
                            title="Edit Vendor"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteVendor(v.id)}
                            className="p-1.5 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
                            title="Delete Vendor"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
