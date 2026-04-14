/**
 * Format a number as currency using the given currency code.
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format an ISO date string or Date to a short human-readable date.
 */
export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * Return the Australian financial year label for a start year.
 * e.g. 2024 → "FY 2024–25"
 */
export function fyLabel(startYear: number): string {
  return `FY ${startYear}–${String(startYear + 1).slice(2)}`;
}

/**
 * Return the list of available financial year start years (most recent first).
 */
export function getAvailableFinancialYears(count = 4): number[] {
  const today = new Date();
  const currentFyStart = today.getMonth() >= 6 ? today.getFullYear() : today.getFullYear() - 1;
  return Array.from({ length: count }, (_, i) => currentFyStart - i);
}

/**
 * Return the current financial year start year.
 */
export function getCurrentFyStartYear(): number {
  const today = new Date();
  return today.getMonth() >= 6 ? today.getFullYear() : today.getFullYear() - 1;
}

/**
 * Return the start and end Date for a financial year starting on July 1.
 */
export function fyDates(startYear: number): { start: Date; end: Date } {
  return {
    start: new Date(startYear, 6, 1),  // July 1
    end: new Date(startYear + 1, 6, 1), // July 1 next year
  };
}

export const CURRENCIES = [
  { code: 'USD', label: 'USD — US Dollar' },
  { code: 'AUD', label: 'AUD — Australian Dollar' },
  { code: 'GBP', label: 'GBP — British Pound' },
  { code: 'EUR', label: 'EUR — Euro' },
  { code: 'CAD', label: 'CAD — Canadian Dollar' },
  { code: 'NZD', label: 'NZD — New Zealand Dollar' },
  { code: 'SGD', label: 'SGD — Singapore Dollar' },
  { code: 'JPY', label: 'JPY — Japanese Yen' },
  { code: 'CHF', label: 'CHF — Swiss Franc' },
  { code: 'INR', label: 'INR — Indian Rupee' },
];

export const EXPENSE_CATEGORIES = [
  'Software',
  'Hardware',
  'Marketing',
  'Travel',
  'Office',
  'Contractor',
  'Other',
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];
