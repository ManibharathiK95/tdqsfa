import { db } from './firebase';
import { ref, set, onValue } from 'firebase/database';
import {
  INITIAL_USERS,
  INITIAL_COMPANY_SETTINGS,
  INITIAL_VENDORS,
  INITIAL_QUOTATIONS,
  INITIAL_INVOICES,
  INITIAL_RECEIPTS,
  INITIAL_TRANSACTIONS,
} from '../data/initialData';
import { User, CompanySettings, VendorContractor, Quotation, Invoice, Receipt, Transaction } from '../types';

// ──────────────────────────────────────
// 1. KEYS & HELPERS
// ──────────────────────────────────────

const USERS_KEY = 'tdqs_users';
const COMPANY_KEY = 'tdqs_company';
const VENDORS_KEY = 'tdqs_vendors';
const QUOTATIONS_KEY = 'tdqs_quotations';
const INVOICES_KEY = 'tdqs_invoices';
const RECEIPTS_KEY = 'tdqs_receipts';
const TRANSACTIONS_KEY = 'tdqs_transactions';
const CURRENT_USER_KEY = 'tdqs_current_user';

const parse = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

// ★ SEED DATA LOGIC ★
const initializeIfEmpty = () => {
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(COMPANY_KEY, JSON.stringify(INITIAL_COMPANY_SETTINGS));
    localStorage.setItem(VENDORS_KEY, JSON.stringify(INITIAL_VENDORS));
    localStorage.setItem(QUOTATIONS_KEY, JSON.stringify(INITIAL_QUOTATIONS));
    localStorage.setItem(INVOICES_KEY, JSON.stringify(INITIAL_INVOICES));
    localStorage.setItem(RECEIPTS_KEY, JSON.stringify(INITIAL_RECEIPTS));
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(INITIAL_TRANSACTIONS));
  }
};

initializeIfEmpty();


// ──────────────────────────────────────
// 2. STORAGE OBJECT (with ultimate failsafes)
// ──────────────────────────────────────

export const Storage = {
  getUsers: () => {
    const u = parse<User[]>(USERS_KEY, []);
    // ULTIMATE FAILSAFE: If users ever load as empty array, force default users
    return u.length > 0 ? u : INITIAL_USERS;
  },
  setUsers: (data: User[]) => localStorage.setItem(USERS_KEY, JSON.stringify(data)),
  
  getCompanySettings: () => {
    const c = parse<CompanySettings>(COMPANY_KEY, INITIAL_COMPANY_SETTINGS);
    return c.companyName ? c : INITIAL_COMPANY_SETTINGS;
  },
  setCompanySettings: (data: CompanySettings) => localStorage.setItem(COMPANY_KEY, JSON.stringify(data)),
  
  getVendors: () => {
    const v = parse<VendorContractor[]>(VENDORS_KEY, []);
    return v.length > 0 ? v : INITIAL_VENDORS;
  },
  setVendors: (data: VendorContractor[]) => localStorage.setItem(VENDORS_KEY, JSON.stringify(data)),
  
  getQuotations: () => {
    const q = parse<Quotation[]>(QUOTATIONS_KEY, []);
    return q.length > 0 ? q : INITIAL_QUOTATIONS;
  },
  setQuotations: (data: Quotation[]) => localStorage.setItem(QUOTATIONS_KEY, JSON.stringify(data)),
  
  getInvoices: () => {
    const i = parse<Invoice[]>(INVOICES_KEY, []);
    return i.length > 0 ? i : INITIAL_INVOICES;
  },
  setInvoices: (data: Invoice[]) => localStorage.setItem(INVOICES_KEY, JSON.stringify(data)),
  
  getReceipts: () => {
    const r = parse<Receipt[]>(RECEIPTS_KEY, []);
    return r.length > 0 ? r : INITIAL_RECEIPTS;
  },
  setReceipts: (data: Receipt[]) => localStorage.setItem(RECEIPTS_KEY, JSON.stringify(data)),
  
  getTransactions: () => {
    const t = parse<Transaction[]>(TRANSACTIONS_KEY, []);
    return t.length > 0 ? t : INITIAL_TRANSACTIONS;
  },
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
    initializeIfEmpty();
  }
};


// ──────────────────────────────────────
// 3. FIREBASE CLOUD SYNC
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
