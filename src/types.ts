export type DepartmentId = 'all' | 'design' | 'rebar' | 'qs' | 'architecture';

export interface DepartmentInfo {
  id: DepartmentId;
  name: string;
  code: string;
  description: string;
  iconName: string;
  accentColor: string;
}

export type Role = 'admin' | 'staff';

export interface User {
  id: string;
  name: string;
  pin: string; // 4-digit pin
  role: Role;
  departmentId: DepartmentId; // 'all' for admin
  email: string;
  avatarColor: string;
}

export type VendorType = 'contractor' | 'vendor' | 'subcontractor';

export interface VendorContractor {
  id: string;
  deptId: DepartmentId;
  name: string;
  type: VendorType;
  code: string;
  contactPerson: string;
  email: string;
  phone: string;
  taxId: string;
  category: string;
  address: string;
  status: 'active' | 'inactive';
  totalBilled: number;
  totalPaid: number;
  balanceDue: number;
  notes?: string;
  createdAt: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
}

export type QuotationStatus = 'draft' | 'sent' | 'approved' | 'rejected';

export interface Quotation {
  id: string;
  quotationNo: string;
  deptId: DepartmentId;
  clientName: string;
  clientEmail: string;
  projectTitle: string;
  date: string;
  validUntil: string;
  status: QuotationStatus;
  items: LineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  totalAmount: number;
  notes?: string;
  terms?: string;
  createdAt: string;
}

export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'overdue' | 'partial';

export interface Invoice {
  id: string;
  invoiceNo: string;
  deptId: DepartmentId;
  quotationId?: string;
  clientName: string;
  clientEmail: string;
  projectTitle: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  items: LineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  notes?: string;
  paymentTerms?: string;
  createdAt: string;
}

export type PaymentMode = 'bank_transfer' | 'cheque' | 'cash' | 'online';
export type ReceiptType = 'incoming' | 'outgoing';

export interface Receipt {
  id: string;
  receiptNo: string;
  deptId: DepartmentId;
  invoiceNo?: string;
  clientOrVendorName: string;
  type: ReceiptType;
  paymentDate: string;
  paymentMode: PaymentMode;
  referenceNo: string;
  amount: number;
  status: 'cleared' | 'pending';
  notes?: string;
  createdAt: string;
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  deptId: DepartmentId;
  transactionType: TransactionType;
  category: string;
  amount: number;
  date: string;
  payeeOrPayer: string;
  referenceNo?: string;
  receiptId?: string;
  notes?: string;
  status: 'recorded' | 'verified';
  createdAt: string;
}

export interface CompanySettings {
  companyName: string;
  tagline: string;
  email: string;
  phone: string;
  address: string;
  taxId: string;
  currencySymbol: string;
  currencyCode: string;
  defaultTaxRate: number;
}
