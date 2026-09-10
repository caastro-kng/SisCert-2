import React from 'react';
import { Certificate } from '../../types';

interface CertificateBackDocumentProps {
  certificate: Partial<Certificate>;
  className?: string;
}

/** Verso padrão nativo: não depende de imagem externa na exportação PDF. */
export const CertificateBackDocument: React.FC<CertificateBackDocumentProps> = ({ certificate, className = '' }) => (
  <div id={`certificate-a4-back-${certificate.id || 'preview'}`} className={`relative overflow-hidden bg-[#fbf7ef] p-[5%] text-[#123d2c] ${className}`} style={{ width: '100%', aspectRatio: '297 / 210', containerType: 'inline-size' }}>
    <div className="absolute inset-[2.2%] border-[3px] border-[#123d2c]" /><div className="absolute inset-[3.3%] border border-[#b9881d]" />
    <div className="relative z-10 h-full"><header className="border-b-2 border-[#b9881d] pb-[2%] text-center"><p className="text-[clamp(8px,1cqw,14px)] font-semibold tracking-[0.18em]">BASE ADMINISTRATIVA DO QUARTEL-GENERAL DO EXÉRCITO - FORTE CAXIAS</p><h2 className="mt-[1%] font-serif text-[clamp(22px,3.5cqw,50px)] font-bold tracking-wide">CONTEÚDO PROGRAMÁTICO</h2><p className="mt-[1%] text-[clamp(8px,1cqw,14px)]">Certificado nº {certificate.certificateNumber || '—'}</p></header>
      <div className="mt-[4%] overflow-hidden border border-[#8b7a52]"><div className="grid grid-cols-[1.35fr_.8fr_.8fr_1.25fr] bg-[#eee4cd] text-center text-[clamp(8px,1cqw,15px)] font-bold text-[#342b18]"><div className="border-r border-[#8b7a52] p-2">DISCIPLINA</div><div className="border-r border-[#8b7a52] p-2">CARGA HORÁRIA</div><div className="border-r border-[#8b7a52] p-2">NOTA</div><div className="p-2">INSTRUTOR</div></div>{[0, 1, 2, 3].map((row) => { const subject = certificate.subjectDetails?.[row]; return <div key={row} className="grid grid-cols-[1.35fr_.8fr_.8fr_1.25fr] border-t border-[#8b7a52] text-center text-[clamp(8px,1cqw,15px)]"><div className="min-h-[3.9cqw] border-r border-[#8b7a52] p-2 font-semibold">{subject?.name || ''}</div><div className="border-r border-[#8b7a52] p-2">{subject?.workload || ''}</div><div className="border-r border-[#8b7a52] p-2">{subject?.evaluation || ''}</div><div className="p-2">{subject?.instructorName || ''}</div></div>; })}</div>
      <p className="absolute bottom-[2%] left-0 right-0 text-center text-[clamp(7px,.85cqw,12px)] text-[#725b1f]">Curso Especializado para Condutores de Veículos de Transporte de Emergência</p>
    </div>
  </div>
);
