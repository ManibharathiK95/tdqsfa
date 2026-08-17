import { db } from './firebase';
import { ref, set, onValue } from 'firebase/database';
import { User, CompanySettings, VendorContractor, Quotation, Invoice, Receipt, Transaction } from '../types';

// ──────────────────────────────────────
// 1. LOCAL STORAGE (Keeps app fast)
// ──────────────────────────────────────

const USERS_KEY = 'tdqs_users';
const COMPANY_KEY = 'tdqs_company';
const VENDORS_KEY = 'tdqs_vendors';
const QUOTATIONS_KEY = 'tdqs_quotations';
const INVOICES_KEY = 'tdqs_invoices';
const RECEIPTS_KEY = 'tdqs_receipts';
const TRANSACTIONS_KEY = 'tdqs_transactions';
const CURRENT_USER_KEY = 'tdqs_current_user';

// Helper to safely parse JSON
const parse = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

export const Storage = {
  getUsers: () => parse<User[]>(USERS_KEY, []),
  setUsers: (data: User[]) => localStorage.setItem(USERS_KEY, JSON.stringify(data)),
  
  getCompanySettings: () => parse<CompanySettings>(COMPANY_KEY, { companyName: '', address: '', phone: '', email: '', website: '', taxId: '', logo: '' }),
  setCompanySettings: (data: CompanySettings) => localStorage.setItem(COMPANY_KEY, JSON.stringify(data)),
  
  getVendors: () => parse<VendorContractor[]>(VENDORS_KEY, []),
  setVendors: (data: VendorContractor[]) => localStorage.setItem(VENDORS_KEY, JSON.stringify(data)),
  
  getQuotations: () => parse<Quotation[]>(QUOTATIONS_KEY, []),
  setQuotations: (data: Quotation[]) => localStorage.setItem(QUOTATIONS_KEY, JSON.stringify(data)),
  
  getInvoices: () => parse<Invoice[]>(INVOICES_KEY, []),
  setInvoices: (data: Invoice[]) => localStorage.setItem(INVOICES_KEY, JSON.stringify(data)),
  
  getReceipts: () => parse<Receipt[]>(RECEIPTS_KEY, []),
  setReceipts: (data: Receipt[]) => localStorage.setItem(RECEIPTS_KEY, JSON.stringify(data)),
  
  getTransactions: () => parse<Transaction[]>(TRANSACTIONS_KEY, []),
  setTransactions: (data: Transaction[]) => localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(data)),

  getCurrentUserId: () => localStorage.getItem(CURRENT_USER_KEY),
  setCurrentUserId: (id: string | null) => {
    if (id) localStorage.setItem(CURRENT_USER_KEY, id);
    else localStorage.removeItem(CURRENT_USER_KEY);
  },

  resetAllData: () => {
    localStorage.removeItem(USERS_KEY);
    localStorage.removeItem(COMPANY_KEY);
    localStorage.removeItem(VENDORS_KEY);
    localStorage.removeItem(QUOTATIONS_KEY);
    localStorage.removeItem(INVOICES_KEY);
    localStorage.removeItem(RECEIPTS_KEY);
    localStorage.removeItem(TRANSACTIONS_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};


// ──────────────────────────────────────
// 2. FIREBASE CLOUD SYNC (For all devices)
// ──────────────────────────────────────

const DB_PATH = 'erpData';

export const saveDataToCloud = async (data: {
  users: User[];
  companySettings: CompanySettings;
  vendors: VendorContractor[];
  quotations: Quotation[];
  invoices: Invoice[];
  receipts: Receipt[];
  transactions: Transaction[];
}): Promise<void> => {
  const dataRef = ref(db, DB_PATH);
  await set(dataRef, data);
};

export const subscribeToCloudData = (callback: (data: any) => void) => {
  const dataRef = ref(db, DB_PATH);
  return onValue(dataRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    }
  });
};
