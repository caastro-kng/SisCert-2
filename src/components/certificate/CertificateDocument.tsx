import React from 'react';
import { Certificate, InstitutionConfig } from '../../types';
import { DEFAULT_INSTITUTION_CONFIG } from '../../services/storage';

interface CertificateDocumentProps {
  certificate: Partial<Certificate>;
  config?: InstitutionConfig;
  className?: string;
  isCancelled?: boolean;
}

const months = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
];

function splitDate(value?: string) {
  if (!value) return { day: '', month: '', year: '' };
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return { day: '', month: '', year: '' };
  return {
    day: String(day).padStart(2, '0'),
    month: months[month - 1],
    year: String(year),
  };
}

function splitCertificateNumber(value?: string) {
  const raw = value?.trim() || '';
  const parts = raw.split('/');
  if (parts.length >= 3) {
    return { sequence: parts[0], code: parts[1] || 'CVTE', year: parts[2] };
  }
  return { sequence: raw, code: 'CVTE', year: '' };
}

const SGEXEmblem: React.FC = () => (
  <svg viewBox="0 0 120 150" className="w-full h-full drop-shadow-sm" aria-label="Símbolo SGEX">
    <path d="M12 8H108V91C108 120 88 139 60 146C32 139 12 120 12 91Z" fill="#ef2738" stroke="#d8aa25" strokeWidth="5" />
    <rect x="14" y="10" width="92" height="23" fill="#ed1c24" />
    <rect x="14" y="33" width="92" height="17" fill="#1597c4" />
    <text x="60" y="35" textAnchor="middle" fill="#fff" stroke="#d8aa25" strokeWidth="0.7" fontSize="20" fontFamily="Georgia, serif" fontWeight="700">SGEX</text>
    <path d="M60 52L98 90L60 129L22 90Z" fill="#fff" />
    <path d="M60 64V116" stroke="#e51d2a" strokeWidth="5" strokeLinecap="round" />
    <path d="M37 82L83 103M83 82L37 103" stroke="#e51d2a" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M55 67L60 59L65 67L60 73Z" fill="#e51d2a" />
    <path d="M50 76C45 79 44 89 49 96M70 76C75 79 76 89 71 96" stroke="#e51d2a" strokeWidth="2.5" fill="none" />
  </svg>
);

const BADMQGEXEmblem: React.FC = () => (
  <svg viewBox="0 0 120 150" className="w-full h-full drop-shadow-sm" aria-label="Símbolo BADMQGEX">
    <path d="M12 8H108V91C108 120 88 139 60 146C32 139 12 120 12 91Z" fill="#ed1c24" stroke="#f1bd18" strokeWidth="5" />
    <rect x="14" y="10" width="92" height="23" fill="#ed1c24" />
    <rect x="14" y="33" width="92" height="17" fill="#1698c6" />
    <text x="60" y="31" textAnchor="middle" fill="#fff" fontSize="11" fontFamily="Georgia, serif" fontWeight="700">B ADM QGEX</text>
    <path d="M29 55H91V103C91 121 78 132 60 137C42 132 29 121 29 103Z" fill="#fff" stroke="#f1bd18" strokeWidth="2" />
    <path d="M38 78H83M48 73C55 67 69 67 78 73M49 76H77" stroke="#e51d2a" strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M60 88V126" stroke="#e51d2a" strokeWidth="3.5" />
    <path d="M60 111C51 105 46 103 40 101C43 111 49 117 60 121C71 117 77 111 80 101C74 103 69 105 60 111Z" fill="#d7a21c" />
  </svg>
);

export const CertificateDocument: React.FC<CertificateDocumentProps> = ({
  certificate,
  config = DEFAULT_INSTITUTION_CONFIG,
  className = '',
  isCancelled = false,
}) => {
  const name = certificate.name?.trim()?.toUpperCase() || '';
  const cpf = certificate.cpf?.trim() || '';
  const registration = certificate.registrationNumber?.trim() || '';
  const category = certificate.category?.trim()?.toUpperCase() || '';
  const workload = certificate.workload ? String(certificate.workload) : '';
  const number = splitCertificateNumber(certificate.certificateNumber);
  const start = splitDate(certificate.startDate);
  const end = splitDate(certificate.endDate);
  const issue = splitDate(certificate.issueDate);
  const courseYear = end.year || start.year || '';
  const isStatusCancelled = isCancelled || certificate.status === 'Cancelado';

  return (
    <div
      id={`certificate-a4-document-${certificate.id || 'preview'}`}
      className={`certificate-root-element relative overflow-hidden bg-[#fbf7ef] text-[#171717] select-none ${className}`}
      style={{ width: '100%', aspectRatio: '297 / 210', containerType: 'inline-size' }}
    >
      <div className="absolute inset-[2.2%] border-[3px] border-[#123d2c]" />
      <div className="absolute inset-[3.15%] border border-[#b9881d]" />
      <div className="absolute inset-[4%] border border-[#123d2c]/80" />

      <div className="absolute -top-[13%] -left-[9%] w-[35%] h-[22%] rotate-[-35deg] bg-[#123d2c] border-y-[3px] border-[#c49a2e] shadow-lg" />
      <div className="absolute -top-[5%] -left-[10%] w-[32%] h-[7%] rotate-[-35deg] bg-[#184a36] border-b border-[#d5b04d]" />
      <div className="absolute -bottom-[13%] -right-[9%] w-[35%] h-[22%] rotate-[-35deg] bg-[#123d2c] border-y-[3px] border-[#c49a2e] shadow-lg" />
      <div className="absolute -bottom-[5%] -right-[10%] w-[32%] h-[7%] rotate-[-35deg] bg-[#184a36] border-t border-[#d5b04d]" />

      <svg className="absolute left-[3.5%] bottom-[4.2%] w-[5.2%] h-[8%] text-[#bd8b20]" viewBox="0 0 80 80" fill="none">
        <path d="M5 70V20C5 12 12 5 20 5H70M14 70V26C14 19 19 14 26 14H70" stroke="currentColor" strokeWidth="2" />
        <circle cx="25" cy="26" r="3" fill="currentColor" />
        <circle cx="14" cy="55" r="2" fill="currentColor" />
      </svg>
      <svg className="absolute right-[3.5%] top-[4.2%] w-[5.2%] h-[8%] text-[#bd8b20] rotate-180" viewBox="0 0 80 80" fill="none">
        <path d="M5 70V20C5 12 12 5 20 5H70M14 70V26C14 19 19 14 26 14H70" stroke="currentColor" strokeWidth="2" />
        <circle cx="25" cy="26" r="3" fill="currentColor" />
        <circle cx="14" cy="55" r="2" fill="currentColor" />
      </svg>

      <div className="absolute left-1/2 top-[57%] -translate-x-1/2 -translate-y-1/2 w-[42%] h-[56%] opacity-[0.035] pointer-events-none">
        <svg viewBox="0 0 500 500" className="w-full h-full" fill="none">
          <circle cx="250" cy="250" r="170" stroke="#0f3c2a" strokeWidth="2" />
          {Array.from({ length: 32 }).map((_, i) => {
            const angle = (i * 360) / 32;
            return <path key={i} d="M250 58L263 220L442 250L263 280L250 442L237 280L58 250L237 220Z" transform={`rotate(${angle} 250 250)`} stroke="#0f3c2a" strokeWidth="0.65" />;
          })}
          <path d="M250 115V385M168 205L332 295M332 205L168 295" stroke="#0f3c2a" strokeWidth="4" />
          <path d="M125 350C165 315 205 305 250 330C295 305 335 315 375 350" stroke="#0f3c2a" strokeWidth="3" />
        </svg>
      </div>

      <div className="absolute left-[14.5%] top-[9.5%] w-[8.2%] h-[16.5%]">
        <SGEXEmblem />
      </div>
      <div className="absolute right-[14.2%] top-[9.5%] w-[8.2%] h-[16.5%]">
        <BADMQGEXEmblem />
      </div>

      <div className="absolute top-[10%] left-[26%] right-[26%] text-center">
        <div className="flex items-center justify-center gap-3 mb-[1.2%]">
          <span className="h-px w-[23%] bg-[#b8871c]" />
          <span className="text-[#b8871c] text-[clamp(9px,1.15cqw,18px)]">❧</span>
          <span className="h-px w-[23%] bg-[#b8871c]" />
        </div>
        <h1 className="font-serif text-[#123d2c] text-[clamp(26px,5.2cqw,82px)] leading-[0.9] tracking-[0.035em] font-semibold">
          CERTIFICADO
        </h1>
        <div className="mt-[2.2%] uppercase text-[#725b1f] text-[clamp(9px,1.65cqw,25px)] tracking-[0.16em] font-semibold leading-tight">
          CONDUTORES DE VEÍCULOS DE<br />TRANSPORTE DE EMERGÊNCIA
        </div>
        <div className="flex items-center justify-center gap-2 mt-[2%] text-[#bd8b20]">
          <span className="h-px w-[18%] bg-[#bd8b20]" /><span className="text-[clamp(8px,1cqw,15px)]">✦</span><span className="h-px w-[18%] bg-[#bd8b20]" />
        </div>
      </div>

      <div className="absolute right-[11.8%] top-[30.3%] flex items-end justify-center gap-[0.35cqw] text-[#111] font-medium text-[clamp(9px,1.35cqw,21px)] whitespace-nowrap">
        <span className="min-w-[3.6cqw] text-center border-b border-[#333] pb-[0.1cqw]">{number.sequence}</span>
        <span>/CVTE/</span>
        <span className="min-w-[4.7cqw] text-center border-b border-[#333] pb-[0.1cqw]">{number.year}</span>
      </div>

      <div className="absolute left-[14.7%] right-[14.7%] top-[38.2%] text-[clamp(8px,1.27cqw,19.5px)] leading-[1.78] font-medium">
        <p>A Instituição de Ensino de Trânsito da Base Administrativa do Quartel-General do Exército – Forte Caxias –</p>
        <p>
          (Instrução Nº 592, de 10 de agosto de 2020/Detran-DF) certifica que{' '}
          <span className="inline-block min-w-[27cqw] text-center border-b border-[#333] font-bold uppercase leading-[1.25]">{name}</span>,
        </p>
        <p>
          inscrito no CPF nº{' '}
          <span className="inline-block min-w-[23cqw] text-center border-b border-[#333] font-bold leading-[1.25]">{cpf}</span>{' '}
          e no Nº DO REGISTRO{' '}
          <span className="inline-block min-w-[19cqw] text-center border-b border-[#333] font-bold leading-[1.25]">{registration}</span>,
        </p>
        <p>
          categoria “<span className="inline-block min-w-[8cqw] text-center border-b border-[#333] font-bold leading-[1.25]">{category}</span>”, concluiu com aproveitamento o{' '}
          <em className="font-semibold">Curso Especializado para Condutores de</em>
        </p>
        <p>Veículos de Transporte de Emergência, ministrado pela IET – Forte Caxias, no período de</p>
        <p>
          <span className="inline-block min-w-[4cqw] text-center border-b border-[#333] font-bold leading-[1.25]">{start.day}</span>{' '}
          a{' '}
          <span className="inline-block min-w-[4cqw] text-center border-b border-[#333] font-bold leading-[1.25]">{end.day}</span>{' '}
          de{' '}
          <span className="inline-block min-w-[14cqw] text-center border-b border-[#333] font-bold leading-[1.25]">{end.month || start.month}</span>{' '}
          de <strong>{courseYear}</strong>, com carga horária de{' '}
          <span className="inline-block min-w-[7cqw] text-center border-b border-[#333] font-bold leading-[1.25]">{workload}</span>{' '}
          horas/aula,
        </p>
        <p>com validade de cinco anos após o término do curso, conforme Resolução Nº 1.020/2025 do CONTRAN.</p>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 top-[72.6%] whitespace-nowrap text-[clamp(8px,1.28cqw,19px)] font-medium">
        Brasília-DF,{' '}
        <span className="inline-block min-w-[4.6cqw] text-center border-b border-[#333] font-bold">{issue.day}</span>{' '}
        de{' '}
        <span className="inline-block min-w-[14cqw] text-center border-b border-[#333] font-bold">{issue.month}</span>{' '}
        de <strong>{issue.year}</strong>.
      </div>

      <div className="absolute left-[14.6%] bottom-[9.4%] w-[22%] text-center text-[clamp(7px,0.92cqw,14px)] leading-[1.35]">
        <div className="border-t border-[#b4861d] mb-[1.3%]" />
        <p className="font-semibold">{config.directorName}</p>
        <p className="font-semibold">{config.directorRole}</p>
        <p className="font-semibold">{config.directorCpf}</p>
      </div>

      <div className="absolute right-[13.7%] bottom-[10.5%] w-[25%] text-center text-[clamp(6px,0.82cqw,12.5px)] leading-[1.45]">
        <p className="font-semibold">CNPJ Nº {config.cnpj}</p>
        <p className="font-semibold uppercase">BASE ADMINISTRATIVA DO QUARTEL-GENERAL DO EXÉRCITO</p>
      </div>

      {isStatusCancelled && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-red-950/10 pointer-events-none">
          <div className="border-[6px] border-red-700/80 text-red-700/85 px-[6%] py-[1.6%] rounded-lg -rotate-[18deg] font-black text-[clamp(28px,6cqw,92px)] tracking-[0.18em] uppercase">
            CANCELADO
          </div>
        </div>
      )}
    </div>
  );
};
