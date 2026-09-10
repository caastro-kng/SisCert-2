/**
 * Date utilities for Brazilian Portuguese localization
 */

export function formatDateBR(dateString?: string): string {
  if (!dateString) return '--/--/----';
  // If already in DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) return dateString;
  
  // Format YYYY-MM-DD
  const parts = dateString.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  } catch {
    return dateString;
  }
}

export function formatDateExtenso(dateString?: string, city = 'Brasília - DF'): string {
  if (!dateString) return `${city}, 27 de agosto de 2026`;
  
  let day: number, month: number, year: number;
  
  if (dateString.includes('-')) {
    const parts = dateString.split('-');
    year = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10) - 1;
    day = parseInt(parts[2], 10);
  } else if (dateString.includes('/')) {
    const parts = dateString.split('/');
    day = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10) - 1;
    year = parseInt(parts[2], 10);
  } else {
    const d = new Date(dateString);
    day = d.getDate();
    month = d.getMonth();
    year = d.getFullYear();
  }

  const months = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];

  const monthName = months[month] || 'agosto';
  return `${city}, ${day} de ${monthName} de ${year}`;
}

export function formatPeriodBR(startDate?: string, endDate?: string): string {
  const start = formatDateBR(startDate);
  const end = formatDateBR(endDate);
  if (!startDate && !endDate) return 'Período a definir';
  if (startDate && !endDate) return `A partir de ${start}`;
  return `${start} a ${end}`;
}

export function getTodayISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
