/**
 * CPF formatting and official mathematical validation algorithm
 */

export function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

export function cleanCPF(value: string): string {
  return value.replace(/\D/g, '');
}

export function validateCPF(cpf: string): boolean {
  const clean = cleanCPF(cpf);
  if (clean.length !== 11) return false;
  
  // Reject repetitive numbers (00000000000, 11111111111, etc.)
  if (/^(\d)\1{10}$/.test(clean)) return false;

  // Validate 1st check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(clean.charAt(i), 10) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(clean.charAt(9), 10)) return false;

  // Validate 2nd check digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(clean.charAt(i), 10) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(clean.charAt(10), 10)) return false;

  return true;
}

export function maskCPFForPublic(cpf: string): string {
  const formatted = formatCPF(cpf);
  if (formatted.length < 14) return '***.***.***-**';
  // e.g. 123.456.789-00 -> ***.456.789-**
  return `***.${formatted.substring(4, 11)}-**`;
}
