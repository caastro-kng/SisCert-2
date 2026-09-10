import React, { useEffect, useState } from 'react';
import { Certificate, InstitutionConfig } from '../../types';
import { CertificateDocument } from './CertificateDocument';
import { CertificateBackDocument } from './CertificateBackDocument';
import { ActionButton } from '../common/ActionButton';
import { downloadCertificatePDF, triggerPrintCertificate } from '../../utils/pdf';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Download,
  Printer,
  X,
  FileCheck,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

interface CertificatePreviewModalProps {
  certificate: Partial<Certificate>;
  config?: InstitutionConfig;
  isOpen: boolean;
  onClose: () => void;
  onEmitClick?: () => void;
  isEmitStep?: boolean;
}

export const CertificatePreviewModal: React.FC<CertificatePreviewModalProps> = ({
  certificate,
  config,
  isOpen,
  onClose,
  onEmitClick,
  isEmitStep = false,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [pdfProgressStatus, setPdfProgressStatus] = useState<string>('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || isGeneratingPDF || isPrinting) return;
      if (isFullscreen) setIsFullscreen(false);
      else onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, isFullscreen, isGeneratingPDF, isPrinting, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setZoomLevel(100);
      setIsFullscreen(false);
      setFeedback(null);
      setPdfProgressStatus('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const busy = isGeneratingPDF || isPrinting;
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 15, 160));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 15, 60));
  const handleResetZoom = () => setZoomLevel(100);
  const toggleFullscreen = () => setIsFullscreen((prev) => !prev);
  const getElementId = () => `certificate-a4-document-${certificate.id || 'preview'}`;

  const handleDownloadPDF = async () => {
    try {
      setFeedback(null);
      setIsGeneratingPDF(true);
      await downloadCertificatePDF(getElementId(), certificate, (msg) => setPdfProgressStatus(msg));
      setFeedback({ type: 'success', message: 'PDF gerado com sucesso.' });
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', message: 'Não foi possível gerar o PDF. Tente novamente.' });
    } finally {
      setIsGeneratingPDF(false);
      setPdfProgressStatus('');
    }
  };

  const handlePrint = async () => {
    try {
      setFeedback(null);
      setIsPrinting(true);
      await triggerPrintCertificate(getElementId());
      setFeedback({ type: 'success', message: 'Janela de impressão aberta.' });
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', message: 'Não foi possível abrir a impressão. Tente novamente.' });
    } finally {
      setIsPrinting(false);
    }
  };

  const closeIfAllowed = () => {
    if (!busy) onClose();
  };

  return (
    <div
      id="certificate-preview-modal"
      className="fixed inset-0 z-[80] flex items-center justify-center bg-gray-950/80 p-0 backdrop-blur-[4px] sm:p-4 md:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeIfAllowed();
      }}
    >
      <div
        className={`flex flex-col overflow-hidden border border-gray-800 bg-gray-900 shadow-2xl transition-all duration-200 ${
          isFullscreen ? 'fixed inset-0 z-[81] rounded-none sm:inset-2 sm:rounded-xl' : 'h-[100dvh] w-full rounded-none sm:h-[92vh] sm:max-w-6xl sm:rounded-xl'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="certificate-preview-title"
      >
        <div className="border-b border-gray-800 bg-gray-900 px-3 py-3 text-white sm:px-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="shrink-0 rounded-md border border-[#2D5A47] bg-[#1B4332] p-1.5 text-emerald-300"><FileCheck className="h-4 w-4" /></div>
              <div className="min-w-0">
                <h3 id="certificate-preview-title" className="truncate text-sm font-semibold text-gray-100">Visualização do Certificado</h3>
                <p className="truncate font-mono text-[11px] text-gray-400 sm:text-xs">{certificate.certificateNumber || '000/CVTE/2026'} • A4 horizontal</p>
              </div>
            </div>
            <button id="btn-close-modal" onClick={closeIfAllowed} disabled={busy} className="shrink-0 rounded-md p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white disabled:opacity-40" aria-label="Fechar visualização"><X className="h-5 w-5" /></button>
          </div>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center justify-center gap-1 rounded-md border border-gray-700 bg-gray-800 p-1 sm:justify-start">
              <button id="btn-zoom-out" onClick={handleZoomOut} disabled={zoomLevel <= 60} className="rounded p-1.5 text-gray-300 hover:bg-gray-700 hover:text-white disabled:opacity-30" aria-label="Diminuir zoom"><ZoomOut className="h-4 w-4" /></button>
              <button id="btn-zoom-reset" onClick={handleResetZoom} className="min-w-12 rounded px-2 py-1 text-xs font-mono font-medium text-gray-200 hover:bg-gray-700" title="Voltar para 100%">{zoomLevel}%</button>
              <button id="btn-zoom-in" onClick={handleZoomIn} disabled={zoomLevel >= 160} className="rounded p-1.5 text-gray-300 hover:bg-gray-700 hover:text-white disabled:opacity-30" aria-label="Aumentar zoom"><ZoomIn className="h-4 w-4" /></button>
              <div className="mx-1 h-4 w-px bg-gray-700" />
              <button id="btn-toggle-fullscreen" onClick={toggleFullscreen} className="rounded p-1.5 text-gray-300 hover:bg-gray-700 hover:text-white" aria-label={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}>{isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}</button>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
              <ActionButton id="btn-modal-print" label="Imprimir" icon={Printer} variant="dark" loading={isPrinting} loadingLabel="Abrindo..." disabled={busy && !isPrinting} onClick={handlePrint} fullWidth className="min-h-9 sm:w-auto" />
              <ActionButton id="btn-modal-download-pdf" label="Baixar PDF" icon={Download} variant="primary" loading={isGeneratingPDF} loadingLabel={pdfProgressStatus || 'Gerando...'} disabled={busy && !isGeneratingPDF} onClick={handleDownloadPDF} fullWidth className="min-h-9 sm:w-auto" />
              {isEmitStep && onEmitClick && <ActionButton id="btn-modal-emit-now" label="Avançar para emissão" icon={ArrowRight} variant="primary" disabled={busy} onClick={onEmitClick} fullWidth className="col-span-2 min-h-9 sm:w-auto" />}
            </div>
          </div>

          {feedback && <div className={`mt-3 flex items-center gap-2 rounded-md border px-3 py-2 text-xs ${feedback.type === 'success' ? 'border-emerald-800 bg-emerald-950/50 text-emerald-200' : 'border-red-800 bg-red-950/50 text-red-200'}`} role={feedback.type === 'error' ? 'alert' : 'status'}>{feedback.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}<span>{feedback.message}</span><button onClick={() => setFeedback(null)} className="ml-auto rounded p-1 hover:bg-white/10" aria-label="Fechar mensagem"><X className="h-3.5 w-3.5" /></button></div>}
        </div>

        <div className="flex flex-1 items-start justify-center overflow-auto bg-gray-950 p-3 sm:items-center sm:p-6 md:p-8">
          <div className="origin-top space-y-6 transition-transform duration-150 sm:origin-center" style={{ transform: `scale(${zoomLevel / 100})`, width: 'min(980px, 94vw)' }}>
            <CertificateDocument certificate={certificate} config={config} className="border border-gray-300 shadow-2xl" />
            <CertificateBackDocument certificate={certificate} className="border border-gray-300 shadow-2xl" />
          </div>
        </div>

        <div className="border-t border-gray-800 bg-gray-900 px-4 py-2 text-center text-[10px] text-gray-500 sm:text-left">ESC fecha a visualização • Em tela cheia, ESC retorna primeiro ao modo normal</div>
      </div>
    </div>
  );
};
