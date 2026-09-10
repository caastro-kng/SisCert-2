import React, { useMemo, useState } from 'react';
import { Certificate, NavigationPage } from '../types';
import { StatCard } from '../components/common/StatCard';
import { CertificateStatusBadge } from '../components/common/CertificateStatusBadge';
import { SearchInput } from '../components/common/SearchInput';
import { ActionButton } from '../components/common/ActionButton';
import { PageHeader } from '../components/layout/PageHeader';
import { formatDateBR } from '../utils/date';
import {
  Award,
  Calendar,
  Clock,
  FilePlus2,
  Eye,
  ArrowRight,
  ShieldCheck,
  FileText,
  History,
  Download,
  ChevronRight,
  CircleCheck,
  CircleX,
} from 'lucide-react';

interface DashboardPageProps {
  certificates: Certificate[];
  onNavigate: (page: NavigationPage) => void;
  onViewCertificate: (cert: Certificate) => void;
  onDownloadPDF: (cert: Certificate) => void;
  onEditCertificate: (cert: Certificate) => void;
  onReissueCertificate: (cert: Certificate) => void;
  onCancelCertificate: (cert: Certificate) => void;
}

const maskCpf = (cpf: string) => {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return 'CPF protegido';
  return `***.${digits.slice(3, 6)}.${digits.slice(6, 9)}-**`;
};

const getCertificateTime = (cert: Certificate) => {
  const raw = cert.createdAt || cert.updatedAt || `${cert.issueDate}T00:00:00`;
  const value = new Date(raw).getTime();
  return Number.isNaN(value) ? 0 : value;
};

export const DashboardPage: React.FC<DashboardPageProps> = ({ certificates, onNavigate, onViewCertificate, onDownloadPDF }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [categoryFilter, setCategoryFilter] = useState('todos');

  const activeEmitidos = certificates.filter((c) => c.status === 'Emitido').length;
  const cancelledCount = certificates.filter((c) => c.status === 'Cancelado').length;
  const currentMonthYear = new Date().toISOString().slice(0, 7);
  const emitidosEsteMes = certificates.filter((c) => c.issueDate.startsWith(currentMonthYear) && c.status === 'Emitido').length;
  const canceladosEsteMes = certificates.filter((c) => c.issueDate.startsWith(currentMonthYear) && c.status === 'Cancelado').length;
  const fortyEightHoursAgo = Date.now() - 48 * 60 * 60 * 1000;
  const recentesCount = certificates.filter((c) => c.createdAt && new Date(c.createdAt).getTime() >= fortyEightHoursAgo).length;

  const sortedCertificates = useMemo(
    () => [...certificates].sort((a, b) => getCertificateTime(b) - getCertificateTime(a)),
    [certificates],
  );

  const latestCertificate = sortedCertificates[0] || null;

  const filteredCertificates = useMemo(() => sortedCertificates.filter((cert) => {
    const term = searchTerm.toLowerCase().trim();
    const digits = searchTerm.replace(/\D/g, '');
    const matchesSearch = !term || cert.name.toLowerCase().includes(term) || cert.certificateNumber.toLowerCase().includes(term) || (digits.length >= 3 && cert.cpf.replace(/\D/g, '').includes(digits));
    return matchesSearch && (statusFilter === 'todos' || cert.status === statusFilter) && (categoryFilter === 'todos' || cert.category === categoryFilter);
  }), [sortedCertificates, searchTerm, statusFilter, categoryFilter]);

  const availableCategories = Array.from(new Set(certificates.map((c) => c.category))).filter(Boolean);
  const recentList = filteredCertificates.slice(0, 6);
  const hasFilters = !!searchTerm || statusFilter !== 'todos' || categoryFilter !== 'todos';

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('todos');
    setCategoryFilter('todos');
  };

  return (
    <div id="dashboard-page" className="space-y-6 lg:space-y-8">
      <PageHeader id="dashboard-header" title="Visão Geral" subtitle="Acompanhe a situação dos certificados CVTE e acesse rapidamente as principais ações do SisCert." />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        <StatCard id="stat-total-emitidos" title="Certificados Emitidos" value={activeEmitidos} subtitle={activeEmitidos === 0 ? 'Nenhum certificado emitido' : `${activeEmitidos} certificado${activeEmitidos === 1 ? '' : 's'} ativo${activeEmitidos === 1 ? '' : 's'}`} icon={Award} accentColor="green" onClick={() => onNavigate('certificados')} />
        <StatCard id="stat-emitidos-mes" title="Emitidos este mês" value={emitidosEsteMes} subtitle={emitidosEsteMes === 0 ? 'Nenhuma emissão neste mês' : `${emitidosEsteMes} emissão${emitidosEsteMes === 1 ? '' : 'ões'} neste mês`} icon={Calendar} accentColor="neutral" />
        <StatCard id="stat-recentes" title="Certificados Recentes" value={recentesCount} subtitle={recentesCount === 0 ? 'Nenhuma emissão recente' : `${recentesCount} emissão${recentesCount === 1 ? '' : 'ões'} nas últimas 48h`} icon={Clock} accentColor="neutral" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="rounded-xl border border-[#2D5A47] bg-[#1B4332] p-4 text-white shadow-sm sm:p-5 xl:col-span-7">
          <div className="flex h-full flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3.5">
              <div className="rounded-lg border border-white/10 bg-white/10 p-2.5 text-[#D4AF37]"><ShieldCheck className="h-6 w-6" /></div>
              <div>
                <h3 className="text-sm font-bold sm:text-base">Emissão CVTE padronizada</h3>
                <p className="mt-1 max-w-xl text-xs leading-5 text-white/75">Preencha os dados, revise o certificado e conclua a emissão em um único fluxo.</p>
              </div>
            </div>
            <ActionButton label="Emitir certificado" icon={FilePlus2} variant="primary" size="md" onClick={() => onNavigate('emitir')} fullWidth className="shrink-0 sm:w-auto" />
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5 xl:col-span-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">Última emissão</p>
              <h3 className="mt-1 text-sm font-bold text-gray-900">{latestCertificate ? latestCertificate.certificateNumber : 'Nenhum certificado'}</h3>
            </div>
            {latestCertificate && <CertificateStatusBadge status={latestCertificate.status} size="sm" />}
          </div>
          {latestCertificate ? (
            <div className="mt-4 flex items-end justify-between gap-4 border-t border-gray-100 pt-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900" title={latestCertificate.name}>{latestCertificate.name}</p>
                <p className="mt-1 text-[11px] text-gray-500">Emitido em {formatDateBR(latestCertificate.issueDate)} · Cat. {latestCertificate.category}</p>
              </div>
              <ActionButton label="Visualizar" icon={Eye} variant="secondary" onClick={() => onViewCertificate(latestCertificate)} className="shrink-0" />
            </div>
          ) : (
            <p className="mt-4 border-t border-gray-100 pt-4 text-xs leading-5 text-gray-500">A última emissão aparecerá aqui assim que o primeiro certificado for registrado.</p>
          )}
        </section>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <div><h3 className="text-sm font-bold text-gray-900">Acessos rápidos</h3><p className="mt-0.5 text-[11px] text-gray-500">Atalhos para as áreas mais utilizadas.</p></div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <button onClick={() => onNavigate('emitir')} className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-[#1B4332]"><FilePlus2 className="h-5 w-5" /></span>
            <span className="min-w-0 flex-1"><span className="block text-sm font-bold text-gray-900">Emitir certificado</span><span className="mt-0.5 block text-[11px] text-gray-500">Nova emissão CVTE</span></span>
            <ChevronRight className="h-4 w-4 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-[#1B4332]" />
          </button>
          <button onClick={() => onNavigate('certificados')} className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-700"><FileText className="h-5 w-5" /></span>
            <span className="min-w-0 flex-1"><span className="block text-sm font-bold text-gray-900">Certificados</span><span className="mt-0.5 block text-[11px] text-gray-500">Consultar e gerenciar</span></span>
            <ChevronRight className="h-4 w-4 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-[#1B4332]" />
          </button>
          <button onClick={() => onNavigate('auditoria')} className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700"><History className="h-5 w-5" /></span>
            <span className="min-w-0 flex-1"><span className="block text-sm font-bold text-gray-900">Histórico</span><span className="mt-0.5 block text-[11px] text-gray-500">Acompanhar atividades</span></span>
            <ChevronRight className="h-4 w-4 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-[#1B4332]" />
          </button>
        </div>
      </section>

      {!!certificates.length && (
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700"><CircleCheck className="h-5 w-5" /></span><div><p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Ativos</p><p className="text-lg font-bold text-gray-900">{activeEmitidos}</p></div></div>
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600"><CircleX className="h-5 w-5" /></span><div><p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Cancelados</p><p className="text-lg font-bold text-gray-900">{cancelledCount}</p></div></div>
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-700"><Calendar className="h-5 w-5" /></span><div><p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Movimentação no mês</p><p className="text-lg font-bold text-gray-900">{emitidosEsteMes + canceladosEsteMes}</p></div></div>
        </section>
      )}

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="space-y-3 border-b border-gray-100 px-4 py-4 sm:px-5 lg:px-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div><h3 className="text-sm font-bold text-gray-900 sm:text-base">Emissões recentes</h3><p className="mt-0.5 text-[11px] text-gray-500">Consulte rapidamente os últimos certificados registrados.</p></div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center"><SearchInput id="dashboard-search" value={searchTerm} onChange={setSearchTerm} placeholder="Buscar por nome, CPF ou certificado..." className={`w-full sm:w-72 ${certificates.length === 0 ? 'pointer-events-none opacity-60' : ''}`} /><select value={statusFilter} disabled={certificates.length === 0} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs"><option value="todos">Todos os status</option><option value="Emitido">Emitido</option><option value="Cancelado">Cancelado</option></select><select value={categoryFilter} disabled={certificates.length === 0} onChange={(e) => setCategoryFilter(e.target.value)} className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs"><option value="todos">Todas as categorias</option>{availableCategories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}</select></div>
          </div>
          {hasFilters && <div className="flex items-center justify-between gap-3"><p className="text-[11px] text-gray-400">{filteredCertificates.length} resultado{filteredCertificates.length === 1 ? '' : 's'} encontrado{filteredCertificates.length === 1 ? '' : 's'}.</p><button onClick={clearFilters} className="text-[11px] font-semibold text-[#1B4332] hover:underline">Limpar filtros</button></div>}
        </div>

        {certificates.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-14 text-center"><div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-gray-500"><Award className="h-6 w-6" /></div><h4 className="text-base font-bold">Nenhum certificado emitido</h4><p className="mt-1 max-w-sm text-sm text-gray-500">Os certificados emitidos aparecerão aqui para consulta e gerenciamento.</p><ActionButton label="Emitir certificado" icon={FilePlus2} variant="primary" size="md" onClick={() => onNavigate('emitir')} className="mt-4" /></div>
        ) : recentList.length === 0 ? (
          <div className="px-5 py-12 text-center"><p className="text-sm font-semibold text-gray-700">Nenhum resultado para os filtros atuais.</p><button onClick={clearFilters} className="mt-2 text-xs font-semibold text-[#1B4332] hover:underline">Limpar filtros</button></div>
        ) : (
          <>
            <div className="divide-y divide-gray-100 md:hidden">
              {recentList.map((cert) => <article key={cert.id} className="p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="font-mono text-xs font-bold text-[#1B4332]">{cert.certificateNumber}</p><h4 className="mt-1 truncate text-sm font-semibold text-gray-900">{cert.name}</h4><p className="mt-1 font-mono text-[11px] text-gray-400">{maskCpf(cert.cpf)}</p></div><CertificateStatusBadge status={cert.status} size="sm" /></div><div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3"><span className="text-[11px] text-gray-500">Emissão {formatDateBR(cert.issueDate)}</span><div className="flex items-center gap-1">{cert.status === 'Emitido' && <ActionButton label="Baixar PDF" icon={Download} variant="ghost" onClick={() => onDownloadPDF(cert)} className="px-2" />}<ActionButton label="Visualizar" icon={Eye} variant="ghost" onClick={() => onViewCertificate(cert)} className="px-2" /></div></div></article>)}
            </div>

            <div className="hidden overflow-x-auto md:block"><table className="w-full text-left"><thead className="border-b border-gray-100 bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400"><tr><th className="px-5 py-3">Nº Certificado</th><th className="px-5 py-3">Participante</th><th className="px-5 py-3">Emissão</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Ações</th></tr></thead><tbody className="divide-y divide-gray-50 text-sm">{recentList.map((cert) => <tr key={cert.id} className="hover:bg-gray-50"><td className="px-5 py-4 font-mono text-xs font-semibold text-[#1B4332]">{cert.certificateNumber}</td><td className="px-5 py-4"><div className="font-medium text-gray-900">{cert.name}</div><div className="font-mono text-[11px] text-gray-400">{maskCpf(cert.cpf)}</div></td><td className="px-5 py-4 text-xs text-gray-600">{formatDateBR(cert.issueDate)}</td><td className="px-5 py-4"><CertificateStatusBadge status={cert.status} size="sm" /></td><td className="px-5 py-4 text-right"><div className="flex items-center justify-end gap-1">{cert.status === 'Emitido' && <ActionButton label="Baixar PDF" icon={Download} variant="ghost" onClick={() => onDownloadPDF(cert)} />}<ActionButton label="Visualizar" icon={Eye} variant="ghost" onClick={() => onViewCertificate(cert)} /></div></td></tr>)}</tbody></table></div>
          </>
        )}

        {!!certificates.length && <div className="flex justify-end border-t border-gray-100 bg-gray-50/70 px-4 py-3 sm:px-5"><button onClick={() => onNavigate('certificados')} className="flex items-center gap-1 text-xs font-semibold text-[#1B4332] hover:underline">Ver todos os certificados <ArrowRight className="h-3.5 w-3.5" /></button></div>}
      </section>
    </div>
  );
};