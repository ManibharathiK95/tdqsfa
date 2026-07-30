import { CompanySettings } from '../types';

export function formatCurrency(amount: number, settings?: CompanySettings): string {
  const symbol = settings?.currencySymbol || 'AED';
  const space = symbol.length > 1 ? ' ' : '';
  const num = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return `${symbol}${space}${num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function downloadCSV(filename: string, rows: (string | number)[][]) {
  const csvContent =
    'data:text/csv;charset=utf-8,' +
    rows
      .map((e) =>
        e
          .map((cell) => {
            const val = cell === null || cell === undefined ? '' : String(cell);
            // Escape double quotes
            return `"${val.replace(/"/g, '""')}"`;
          })
          .join(',')
      )
      .join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadJSON(filename: string, data: Record<string, unknown>) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
