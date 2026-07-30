import {
  User,
  VendorContractor,
  Quotation,
  Invoice,
  Receipt,
  Transaction,
  CompanySettings,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_COMPANY_SETTINGS,
  INITIAL_VENDORS,
  INITIAL_QUOTATIONS,
  INITIAL_INVOICES,
  INITIAL_RECEIPTS,
  INITIAL_TRANSACTIONS,
} from '../data/initialData';

const KEYS = {
  USERS: 'tdqs_erp_users',
  SETTINGS: 'tdqs_erp_company_settings',
  VENDORS: 'tdqs_erp_vendors',
  QUOTATIONS: 'tdqs_erp_quotations',
  INVOICES: 'tdqs_erp_invoices',
  RECEIPTS: 'tdqs_erp_receipts',
  TRANSACTIONS: 'tdqs_erp_transactions',
  CURRENT_USER_ID: 'tdqs_erp_current_user_id',
};

// Generic getItem with fallback initialization
function getStoredItem<T>(key: string, defaultData: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Failed to load ${key} from storage:`, err);
    return defaultData;
  }
}

// Generic setItem
function setStoredItem<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Failed to save ${key} to storage:`, err);
  }
}

export const Storage = {
  getUsers: (): User[] => getStoredItem(KEYS.USERS, INITIAL_USERS),
  setUsers: (users: User[]) => setStoredItem(KEYS.USERS, users),

  getCompanySettings: (): CompanySettings => {
    const loaded = getStoredItem(KEYS.SETTINGS, INITIAL_COMPANY_SETTINGS);
    const companyName =
      !loaded.companyName || loaded.companyName.includes('Engineering & Cost')
        ? INITIAL_COMPANY_SETTINGS.companyName
        : loaded.companyName;
    const currencySymbol =
      !loaded.currencySymbol || loaded.currencySymbol === '$' ? 'AED' : loaded.currencySymbol;
    const currencyCode =
      !loaded.currencyCode || loaded.currencyCode === 'USD' ? 'AED' : loaded.currencyCode;

    return {
      ...loaded,
      companyName,
      currencySymbol,
      currencyCode,
    };
  },
  setCompanySettings: (settings: CompanySettings) =>
    setStoredItem(KEYS.SETTINGS, settings),

  getVendors: (): VendorContractor[] => getStoredItem(KEYS.VENDORS, INITIAL_VENDORS),
  setVendors: (items: VendorContractor[]) => setStoredItem(KEYS.VENDORS, items),

  getQuotations: (): Quotation[] => getStoredItem(KEYS.QUOTATIONS, INITIAL_QUOTATIONS),
  setQuotations: (items: Quotation[]) => setStoredItem(KEYS.QUOTATIONS, items),

  getInvoices: (): Invoice[] => getStoredItem(KEYS.INVOICES, INITIAL_INVOICES),
  setInvoices: (items: Invoice[]) => setStoredItem(KEYS.INVOICES, items),

  getReceipts: (): Receipt[] => getStoredItem(KEYS.RECEIPTS, INITIAL_RECEIPTS),
  setReceipts: (items: Receipt[]) => setStoredItem(KEYS.RECEIPTS, items),

  getTransactions: (): Transaction[] => getStoredItem(KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS),
  setTransactions: (items: Transaction[]) => setStoredItem(KEYS.TRANSACTIONS, items),

  getCurrentUserId: (): string | null => {
    try {
      return localStorage.getItem(KEYS.CURRENT_USER_ID);
    } catch {
      return null;
    }
  },

  setCurrentUserId: (userId: string | null) => {
    try {
      if (userId) {
        localStorage.setItem(KEYS.CURRENT_USER_ID, userId);
      } else {
        localStorage.removeItem(KEYS.CURRENT_USER_ID);
      }
    } catch (e) {
      console.error(e);
    }
  },

  resetAllData: () => {
    try {
      localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(INITIAL_COMPANY_SETTINGS));
      localStorage.setItem(KEYS.VENDORS, JSON.stringify(INITIAL_VENDORS));
      localStorage.setItem(KEYS.QUOTATIONS, JSON.stringify(INITIAL_QUOTATIONS));
      localStorage.setItem(KEYS.INVOICES, JSON.stringify(INITIAL_INVOICES));
      localStorage.setItem(KEYS.RECEIPTS, JSON.stringify(INITIAL_RECEIPTS));
      localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
    } catch (err) {
      console.error('Failed to reset data:', err);
    }
  },
};
