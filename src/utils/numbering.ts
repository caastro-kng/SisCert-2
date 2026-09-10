import { Certificate } from '../types';

/**
 * Gera o próximo número sequencial no formato 001/CVTE/2026.
 * A numeração considera apenas certificados do mesmo ano.
 */
export function generateNextCertificateNumber(
  existingCertificates: Certificate[],
  year = new Date().getFullYear()
): string {
  const yearStr = String(year);
  let maxSeq = 0;

  existingCertificates.forEach((cert) => {
    const match = cert.certificateNumber.trim().match(new RegExp(`^(\\d+)/CVTE/${yearStr}$`, 'i'));
    if (!match) return;
    const seq = Number.parseInt(match[1], 10);
    if (Number.isFinite(seq) && seq > maxSeq) maxSeq = seq;
  });

  return `${String(maxSeq + 1).padStart(3, '0')}/CVTE/${yearStr}`;
}
