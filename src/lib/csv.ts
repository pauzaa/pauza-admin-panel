import Papa from 'papaparse';

import { EXPORT_LIMIT } from '@/lib/constants';

export async function fetchAllPages<TResponse, TItem>(
  fetchPage: (page: number) => Promise<TResponse>,
  extract: (response: TResponse) => { items: TItem[]; total: number },
): Promise<TItem[]> {
  const firstResponse = await fetchPage(1);
  const { items, total } = extract(firstResponse);
  const totalPages = Math.ceil(total / EXPORT_LIMIT);

  if (totalPages <= 1) return [...items];

  const remainingPages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
  const responses = await Promise.all(remainingPages.map(fetchPage));
  const allItems = [...items];
  for (const response of responses) {
    allItems.push(...extract(response).items);
  }

  return allItems;
}

export function downloadCSV(
  data: Record<string, unknown>[],
  filename: string,
): void {
  const csvString = Papa.unparse(data);
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const date = new Date().toISOString().slice(0, 10);

  link.href = url;
  link.download = `${filename}_${date}.csv`;
  link.click();
  setTimeout(() => { URL.revokeObjectURL(url); }, 100);
}
