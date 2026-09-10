import React, { useState } from 'react';
import { AuditLog, Certificate, InstitutionConfig } from '../types';
import { CertificateDocument } from '../components/certificate/CertificateDocument';
import { CertificateStatusBadge } from '../components/common/CertificateStatusBadge';
import { ActionButton } from '../components/common/ActionButton';
import { PageHeader } from '../components/layout/PageHeader';
import { formatDateBR, formatPeriodBR } from '../utils/date';
import { downloadCertificatePDF, triggerPrintCertificate } from '../utils/pdf';
import { ArrowLeft, Ban, Download, History, Printer, RefreshCw } from 'lucide-react';

interface DetalhesCertificadoPageProps {
  certificate: Certificate;
  config: InstitutionConfig;
  logs: AuditLog[];
  onBack: () => void;
  onDownloadPDF: (cert: Certificate) => void;
  onReissue: (cert: Certificate) => void;
  onCancel: (cert: Certificate) => void;
}

export const DetalhesCertificadoPage: React.FC<DetalhesCertificadoPageProps> = ({ certificate, config, logs, onBack, onReissue, onCancel }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const certificateLogs = logs.filter((log) => log.certificateNumber === certificate.certificateNumber);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadCertificatePDF(`certificate-a4-document-${certificate.id}`, certificate);
    } catch (err) {
      console.error(err);
      alert('Erro ao gerar o PDF do certificado.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div id="detalhes-certificado-page" className="space-y-6 lg:space-y-8">
      <PageHeader id="detalhes-header" title={`Certificado ${certificate.certificateNumber}`} subtitle={`Registro individual de emissão de ${certificate.name}.`}>
        <ActionButton label="Voltar" icon={ArrowLeft} variant="secondary" onClick={onBack} className="flex-1 sm:flex-none" />
        <ActionButton label="Imprimir" icon={Printer} variant="secondary" onClick={() => triggerPrintCertificate(`certificate-a4-document-${certificate.id}`)} className="flex-1 sm:flex-none" />
        <ActionButton label="Baixar PDF" icon={Download} variant="primary" loading={isDownloading} onClick={handleDownload} className="flex-1 sm:flex-none" />
      </PageHeader>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-8">
          <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:p-5 lg:p-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3"><CertificateStatusBadge status={certificate.status} /><span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">CVTE</span></div>
            <div className="overflow-hidden rounded-md border border-gray-200 bg-gray-50 shadow-sm"><CertificateDocument certificate={certificate} config={config} /></div>
          </div>
        </div>

        <div className="space-y-4 lg:col-span-4">
          <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <h3 className="border-b border-gray-100 pb-3 text-sm font-bold text-gray-900">Informações do certificado</h3>
            <div className="space-y-3 text-xs">
              <p><span className="block text-gray-500">Nº do Certificado</span><strong className="font-mono text-sm text-[#1B4332]">{certificate.certificateNumber}</strong></p>
              <p><span className="block text-gray-500">Participante</span><strong className="break-words text-sm text-gray-900">{certificate.name}</strong></p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"><p><span className="block text-gray-500">CPF</span><strong className="break-all font-mono">{certificate.cpf}</strong></p><p><span className="block text-gray-500">Registro</span><strong className="break-all font-mono">{certificate.registrationNumber}</strong></p></div>
              <p><span className="block text-gray-500">Categoria CNH</span><strong className="text-[#1B4332]">Categoria {certificate.category}</strong></p>
              <p><span className="block text-gray-500">Curso</span><strong className="leading-5">{certificate.course}</strong></p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"><p><span className="block text-gray-500">Período</span><strong>{formatPeriodBR(certificate.startDate, certificate.endDate)}</strong></p><p><span className="block text-gray-500">Carga horária</span><strong>{certificate.workload} horas/aula</strong></p></div>
              <p className="border-t border-gray-100 pt-3"><span className="block text-gray-500">Data de emissão</span><strong>{formatDateBR(certificate.issueDate)}</strong></p>
              {certificate.status === 'Cancelado' && certificate.cancellationReason && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-900"><strong className="block text-[10px] uppercase tracking-wider">Motivo do cancelamento</strong><p className="mt-1 leading-5">{certificate.cancellationReason}</p></div>}
            </div>

            <div className="grid grid-cols-1 gap-2 border-t border-gray-100 pt-3 sm:grid-cols-2 lg:grid-cols-1">
              <ActionButton label="Reemitir certificado" icon={RefreshCw} variant="secondary" size="md" fullWidth onClick={() => onReissue(certificate)} />
              {certificate.status === 'Emitido' && <ActionButton label="Cancelar certificado" icon={Ban} variant="danger" size="md" fullWidth onClick={() => onCancel(certificate)} />}
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"><h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-700"><History className="h-4 w-4 text-gray-500" />Histórico deste certificado</h3>{certificateLogs.length === 0 ? <p className="py-2 text-xs text-gray-500">Nenhuma ação registrada para este documento.</p> : <div className="space-y-3">{certificateLogs.map((log) => <div key={log.id} className="border-l-2 border-[#1B4332] py-0.5 pl-3 text-xs"><p className="font-semibold text-gray-900">{log.action}</p><p className="mt-0.5 leading-5 text-[11px] text-gray-500">{log.details}</p><p className="mt-1 font-mono text-[10px] leading-4 text-gray-400">{new Date(log.timestamp).toLocaleString('pt-BR')} • {log.user}</p></div>)}</div>}</div>
        </div>
      </div>
    </div>
  );
};
