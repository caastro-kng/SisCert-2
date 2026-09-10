import React, { useEffect, useState } from 'react';
import { AuditLog, Certificate, InstitutionConfig, NavigationPage } from './types';
import {
  DEFAULT_INSTITUTION_CONFIG,
  addAuditLog,
  getStoredCertificates,
  getStoredConfig,
  getStoredLogs,
  saveCertificates,
  saveStoredConfig,
} from './services/storage';

import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { ToastContainer, ToastMessage } from './components/common/Toast';
import { ConfirmModal } from './components/common/ConfirmModal';
import { CertificatePreviewModal } from './components/certificate/CertificatePreviewModal';
import { CertificateDocument } from './components/certificate/CertificateDocument';
import { CertificateBackDocument } from './components/certificate/CertificateBackDocument';
import { DashboardPage } from './pages/DashboardPage';
import { EmitirCertificadoPage } from './pages/EmitirCertificadoPage';
import { CertificadosPage } from './pages/CertificadosPage';
import { DetalhesCertificadoPage } from './pages/DetalhesCertificadoPage';
import { AuditoriaPage } from './pages/AuditoriaPage';
import { ConfiguracoesPage } from './pages/ConfiguracoesPage';
import { downloadCertificatePDF } from './utils/pdf';

export default function App() {
  const [currentPage, setCurrentPage] = useState<NavigationPage>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [config, setConfig] = useState<InstitutionConfig>(DEFAULT_INSTITUTION_CONFIG);
  const [previewCert, setPreviewCert] = useState<Certificate | null>(null);
  const [detailsCert, setDetailsCert] = useState<Certificate | null>(null);
  const [editingCert, setEditingCert] = useState<Certificate | null>(null);
  const [reissuingCert, setReissuingCert] = useState<Certificate | null>(null);
  const [certToCancel, setCertToCancel] = useState<Certificate | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [certToReissuePrompt, setCertToReissuePrompt] = useState<Certificate | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    setCertificates(getStoredCertificates());
    setLogs(getStoredLogs());
    setConfig(getStoredConfig());
  }, []);

  const operatorLabel = `${config.operatorRank} ${config.operatorName}`.trim();

  const showToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    window.setTimeout(() => setToasts((prev) => prev.filter((toast) => toast.id !== id)), 4200);
  };

  const navigate = (page: NavigationPage) => {
    if (page === 'emitir') {
      setEditingCert(null);
      setReissuingCert(null);
    }
    setCurrentPage(page);
    setIsMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCertificateIssued = (newCert: Certificate) => {
    const updated = [newCert, ...certificates];
    setCertificates(updated);
    saveCertificates(updated);

    const isReissue = Boolean(newCert.reissuedFromId);
    addAuditLog(
      isReissue ? 'Certificado reemitido' : 'Certificado criado',
      newCert.certificateNumber,
      isReissue ? `Nova emissão CVTE gerada para ${newCert.name}.` : `Certificado CVTE emitido para ${newCert.name}.`,
      operatorLabel,
    );
    setLogs(getStoredLogs());
    showToast('success', isReissue ? 'Certificado reemitido' : 'Certificado emitido', `Registro ${newCert.certificateNumber} gerado com sucesso.`);
  };

  const handleCertificatesIssued = (newCerts: Certificate[]) => {
    if (!newCerts.length) return;
    const updated = [...newCerts, ...certificates];
    setCertificates(updated);
    saveCertificates(updated);
    newCerts.forEach((cert) => addAuditLog('Certificado criado', cert.certificateNumber, `Certificado CVTE emitido para ${cert.name} com participantes adicionais.`, operatorLabel));
    setLogs(getStoredLogs());
    showToast('success', 'Certificados emitidos', `${newCerts.length} certificados foram registrados com sucesso.`);
  };

  const handleCertificateUpdated = (updatedCert: Certificate) => {
    const updated = certificates.map((cert) => cert.id === updatedCert.id ? updatedCert : cert);
    setCertificates(updated);
    saveCertificates(updated);
    addAuditLog('Certificado editado', updatedCert.certificateNumber, `Dados atualizados para ${updatedCert.name}.`, operatorLabel);
    setLogs(getStoredLogs());
    setEditingCert(null);
    showToast('success', 'Certificado atualizado', `Registro ${updatedCert.certificateNumber} atualizado com sucesso.`);
  };

  const handleConfirmCancelCertificate = () => {
    if (!certToCancel || !cancellationReason.trim()) return;
    const reason = cancellationReason.trim();
    const updated = certificates.map((cert) => cert.id === certToCancel.id ? {
      ...cert,
      status: 'Cancelado' as const,
      cancellationReason: reason,
      cancelledAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } : cert);
    setCertificates(updated);
    saveCertificates(updated);
    addAuditLog('Certificado cancelado', certToCancel.certificateNumber, `Motivo: ${reason}`, operatorLabel);
    setLogs(getStoredLogs());
    if (detailsCert?.id === certToCancel.id) {
      setDetailsCert({ ...detailsCert, status: 'Cancelado', cancellationReason: reason });
    }
    const cancelledNumber = certToCancel.certificateNumber;
    setCertToCancel(null);
    setCancellationReason('');
    showToast('info', 'Certificado cancelado', `${cancelledNumber} foi marcado como cancelado e registrado no Histórico.`);
  };

  const handleConfirmReissuePrompt = () => {
    if (!certToReissuePrompt) return;
    setReissuingCert(certToReissuePrompt);
    setEditingCert(null);
    setCertToReissuePrompt(null);
    setCurrentPage('emitir');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('info', 'Reemissão iniciada', 'Confira os dados carregados antes de gerar o novo certificado.');
  };

  const handleQuickDownloadPDF = async (cert: Certificate) => {
    try {
      showToast('info', 'Gerando PDF', `Preparando ${cert.certificateNumber}...`);
      await downloadCertificatePDF(`print-capture-cert-${cert.id}`, cert);
      addAuditLog('PDF gerado', cert.certificateNumber, `PDF baixado para ${cert.name}.`, operatorLabel);
      setLogs(getStoredLogs());
      showToast('success', 'Download concluído', `PDF ${cert.certificateNumber} gerado com sucesso.`);
    } catch (err) {
      console.error(err);
      showToast('error', 'Não foi possível gerar o PDF', 'Tente novamente. Se o problema continuar, atualize a página.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] font-sans text-[#111827]">
      <Sidebar
        currentPage={currentPage}
        onNavigate={navigate}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        certificatesCount={certificates.filter((cert) => cert.status === 'Emitido').length}
        operatorName={config.operatorName}
        operatorRank={config.operatorRank}
      />

      <Topbar currentPage={currentPage} onNavigate={navigate} onOpenMobileMenu={() => setIsMobileSidebarOpen(true)} isCollapsed={isSidebarCollapsed} />

      <main id="main-app-content" className={`transition-[padding] duration-300 ${isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        <div className="mx-auto w-full max-w-[1440px] px-3 py-5 sm:px-5 sm:py-6 lg:px-8 lg:py-8 xl:px-10">
          {currentPage === 'dashboard' && (
            <DashboardPage certificates={certificates} onNavigate={navigate} onViewCertificate={setPreviewCert} onDownloadPDF={handleQuickDownloadPDF} onEditCertificate={(cert) => { setEditingCert(cert); setReissuingCert(null); setCurrentPage('emitir'); }} onReissueCertificate={setCertToReissuePrompt} onCancelCertificate={setCertToCancel} />
          )}

          {currentPage === 'emitir' && (
            <EmitirCertificadoPage existingCertificates={certificates} config={config} editingCertificate={editingCert} reissuingFrom={reissuingCert} onCertificateIssued={handleCertificateIssued} onCertificatesIssued={handleCertificatesIssued} onCertificateUpdated={handleCertificateUpdated} onCancelEmission={() => { setEditingCert(null); setReissuingCert(null); setCurrentPage('dashboard'); }} />
          )}

          {currentPage === 'certificados' && (
            <CertificadosPage certificates={certificates} onNavigate={navigate} onViewCertificate={setPreviewCert} onDownloadPDF={handleQuickDownloadPDF} onEditCertificate={(cert) => { setEditingCert(cert); setReissuingCert(null); setCurrentPage('emitir'); }} onReissueCertificate={setCertToReissuePrompt} onCancelCertificate={setCertToCancel} onOpenDetails={(cert) => { setDetailsCert(cert); setCurrentPage('detalhes'); }} />
          )}

          {currentPage === 'detalhes' && detailsCert && (
            <DetalhesCertificadoPage certificate={detailsCert} config={config} logs={logs} onBack={() => setCurrentPage('certificados')} onDownloadPDF={handleQuickDownloadPDF} onReissue={setCertToReissuePrompt} onCancel={setCertToCancel} />
          )}

          {currentPage === 'auditoria' && <AuditoriaPage logs={logs} />}

          {currentPage === 'configuracoes' && (
            <ConfiguracoesPage config={config} onSaveConfig={(updated) => { setConfig(updated); saveStoredConfig(updated); showToast('success', 'Perfil atualizado', 'Dados do usuário salvos com sucesso.'); }} />
          )}
        </div>
      </main>

      {previewCert && <CertificatePreviewModal certificate={previewCert} config={config} isOpen={!!previewCert} onClose={() => setPreviewCert(null)} />}

      <ConfirmModal
        isOpen={!!certToCancel}
        onClose={() => { setCertToCancel(null); setCancellationReason(''); }}
        onConfirm={handleConfirmCancelCertificate}
        title="Cancelar certificado?"
        description={`O certificado ${certToCancel?.certificateNumber || ''}${certToCancel?.name ? ` de ${certToCancel.name}` : ''} será marcado como cancelado. Essa ação ficará registrada no Histórico.`}
        confirmText="Confirmar cancelamento"
        cancelText="Voltar"
        variant="danger"
        confirmDisabled={!cancellationReason.trim()}
      >
        <div className="space-y-2">
          <label htmlFor="cancellation-reason" className="block text-xs font-semibold text-gray-700">Motivo do cancelamento *</label>
          <textarea
            id="cancellation-reason"
            required
            rows={3}
            value={cancellationReason}
            onChange={(event) => setCancellationReason(event.target.value)}
            placeholder="Descreva de forma objetiva o motivo do cancelamento."
            className="w-full resize-none rounded-lg border border-gray-300 bg-gray-50 p-3 text-sm text-gray-900 focus:border-red-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-100"
          />
          <p className="text-[11px] leading-4 text-gray-500">O botão de confirmação será liberado após informar o motivo.</p>
        </div>
      </ConfirmModal>

      <ConfirmModal
        isOpen={!!certToReissuePrompt}
        onClose={() => setCertToReissuePrompt(null)}
        onConfirm={handleConfirmReissuePrompt}
        title="Reemitir certificado?"
        description={`Os dados de ${certToReissuePrompt?.name || 'este participante'} serão carregados em uma nova emissão CVTE. O certificado original não será alterado.`}
        confirmText="Iniciar reemissão"
        cancelText="Cancelar"
        variant="primary"
      />

      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((toast) => toast.id !== id))} />

      <div className="pointer-events-none fixed -left-[9999px] top-0 select-none opacity-0">
        {certificates.map((cert) => <React.Fragment key={cert.id}><div id={`print-capture-cert-${cert.id}`} style={{ width: '1122px', height: '793px' }}><CertificateDocument certificate={cert} config={config} /></div><div style={{ width: '1122px', height: '793px' }}><CertificateBackDocument certificate={cert} /></div></React.Fragment>)}
      </div>
    </div>
  );
}
