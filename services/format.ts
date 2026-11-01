/** Phase B of the Greek digital consignment note becomes mandatory on this date. */
export const COMPLIANCE_DEADLINE = new Date(2027, 0, 1);

/** Whole days left until the deadline, never negative. */
export function daysUntil(deadline: Date, from: Date = new Date()): number {
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diff = startOfDay(deadline) - startOfDay(from);
  return Math.max(0, Math.round(diff / 86_400_000));
}

/** dd/mm/yyyy, the format used throughout the Greek UI. */
export function formatDate(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  return d.toLocaleDateString('el-GR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatDateTime(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  return `${formatDate(d)} ${d.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' })}`;
}

/** Greek VAT number: exactly 9 digits. */
export function isValidAfm(afm: string): boolean {
  return /^\d{9}$/.test(afm.trim());
}
