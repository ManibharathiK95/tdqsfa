import {
  DepartmentInfo,
  User,
  VendorContractor,
  Quotation,
  Invoice,
  Receipt,
  Transaction,
  CompanySettings,
} from '../types';

export const DEPARTMENTS: DepartmentInfo[] = [
  {
    id: 'design',
    name: 'Design Department',
    code: 'DES',
    description: 'Structural engineering design, 3D modeling, and calculation analysis.',
    iconName: 'file-blueprint',
    accentColor: 'blue',
  },
  {
    id: 'rebar',
    name: 'Rebar Detailing',
    code: 'RBR',
    description: 'Bar bending schedules (BBS), rebar placement drawings, and steel shop drawings.',
    iconName: 'Rebar',
    accentColor: 'amber',
  },
  {
    id: 'qs',
    name: 'QS & Cost Control',
    code: 'QSC',
    description: 'Bill of Quantities (BOQ), cost estimation, tender analysis, and valuation.',
    iconName: 'Calculator',
    accentColor: 'emerald',
  },
  {
    id: 'architecture',
    name: 'Architecture',
    code: 'ARC',
    description: 'Architectural drafting, elevation concepts, interior detailing, and client presentations.',
    iconName: 'Building2',
    accentColor: 'purple',
  },
];

export const INITIAL_USERS: User[] = [
  {
    id: 'usr_admin',
    name: 'Admin',
    pin: '1334',
    role: 'admin',
    departmentId: 'all',
    email: 'admin@thulirdesign-qs.com',
    avatarColor: 'bg-emerald-700',
  },
  {
    id: 'usr_des',
    name: 'Design',
    pin: '1111',
    role: 'staff',
    departmentId: 'design',
    email: 'design@thulirdesign-qs.com',
    avatarColor: 'bg-emerald-700',
  },
  {
    id: 'usr_rbr',
    name: 'Rebar',
    pin: '2222',
    role: 'staff',
    departmentId: 'rebar',
    email: 'rebar@thulirdesign-qs.com',
    avatarColor: 'bg-emerald-700',
  },
  {
    id: 'usr_qs',
    name: 'QS & CA',
    pin: '3333',
    role: 'staff',
    departmentId: 'qs',
    email: 'qs@thulirdesign-qs.com',
    avatarColor: 'bg-emerald-700',
  },
  {
    id: 'usr_arc',
    name: 'Architect',
    pin: '4444',
    role: 'staff',
    departmentId: 'architecture',
    email: 'arch@thulirdesign-qs.com',
    avatarColor: 'bg-emerald-700',
  },
];
export const INITIAL_COMPANY_SETTINGS: CompanySettings = {
  companyName: 'Thulir Design & QS Services FZE',
  tagline: 'Precision Architectural Design, Quantity Surveying & Engineering Detailing',
  email: 'info@thulirdesign-qs.com',
  phone: '+971 55 667 6720',
  address: 'Sharjah Freezone, Sharjah, UAE',
  taxId: 'Nill',
  currencySymbol: 'AED',
  currencyCode: 'AED',
  defaultTaxRate: 0,
  bankName: 'RAK Bank',
  accountNumber: '0573724435001',
  iban: 'AE55 0400 0005 7372 4435 001',
},

export const INITIAL_VENDORS: VendorContractor[] = [];

export const INITIAL_QUOTATIONS: Quotation[] = [];

export const INITIAL_INVOICES: Invoice[] = [];

export const INITIAL_RECEIPTS: Receipt[] = [];

// Only manual expense transactions — income derives from incoming receipts
export const INITIAL_TRANSACTIONS: Transaction[] = [];
