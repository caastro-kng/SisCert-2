import React, { useMemo, useState } from 'react';
import { Certificate, NavigationPage } from '../types';
import { CertificateStatusBadge } from '../components/common/CertificateStatusBadge';
import { SearchInput } from '../components/common/SearchInput';
import { ActionButton } from '../components/common/ActionButton';
import { PageHeader } from '../components/layout/PageHeader';
import { EmptyState } from '../components/common/EmptyState';
import { formatDateBR } from '../utils/date';
import { ArrowUpDown, Ban, Download, Edit3, Eye, FilePlus2, FileSpreadsheet, MoreHorizontal, RefreshCw, X } from 'lucide-react';

interface CertificadosPageProps {
  certificates: Certificate[];
  onNavigate: (page: NavigationPage) => void;
  onViewCertificate: (cert: Certificate) => void;
  onDownloadPDF: (cert: Certificate) => void;
  onEditCertificate: (cert: Certificate) => void;
  onReissueCertificate: (cert: Certificate) => void;
  onCancelCertificate: (cert: Certificate) => void;
  onOpenDetails: (cert: Certificate) => void;
}

type SortField = 'certificateNumber' | 'name' | 'issueDate' | 'status';
type SortOrder = 'asc' | 'desc';

const maskCpf = (cpf: string) => {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return 'CPF protegido';
  return `***.${digits.slice(3, 6)}.${digits.slice(6, 9)}-**`;
};

export const CertificadosPage: React.FC<CertificadosPageProps> = ({ certificates, onNavigate, onViewCertificate, onDownloadPDF, onEditCertificate, onReissueCertificate, onCancelCertificate, onOpenDetails }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [categoryFilter, setCategoryFilter] = useState('todos');
  const [sortField, setSortField] = useState<SortField>('issueDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [openActionsId, setOpenActionsId] = useState<string | null>(null);
  const itemsPerPage = 8;

  const availableCategories = useMemo(() => Array.from(new Set(certificates.map((c) => c.category))).filter(Boolean), [certificates]);
  const issuedCount = certificates.filter((c) => c.status === 'Emitido').length;
  const cancelledCount = certificates.filter((c) => c.status === 'Cancelado').length;

  const filtered = useMemo(() => {
    const result = certificates.filter((cert) => {
      const term = searchTerm.toLowerCase().trim();
      const digits = searchTerm.replace(/\D/g, '');
      const matchesSearch = !term || cert.name.toLowerCase().includes(term) || cert.certificateNumber.toLowerCase().includes(term) || cert.registrationNumber.includes(digits || searchTerm) || (digits.length >= 3 && cert.cpf.replace(/\D/g, '').includes(digits));
      return matchesSearch && (statusFilter === 'todos' || cert.status === statusFilter) && (categoryFilter === 'todos' || cert.category === categoryFilter);
    });
    return result.sort((a, b) => {
      const comparison = String(a[sortField]).localeCompare(String(b[sortField]), 'pt-BR', { numeric: true });
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [certificates, searchTerm, statusFilter, categoryFilter, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);
  const firstResult = filtered.length ? (safePage - 1) * itemsPerPage + 1 : 0;
  const lastResult = Math.min(safePage * itemsPerPage, filtered.length);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortOrder((value) => value === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortOrder('asc'); }
  };

  const clearFilters = () => { setSearchTerm(''); setStatusFilter('todos'); setCategoryFilter('todos'); setCurrentPage(1); };

  const handleExportCSV = () => {
    const headers = ['Numero_Certificado','Nome_Participante','CPF','Registro','Categoria','Curso','Carga_Horaria','Data_Inicio','Data_Fim','Data_Emissao','Status'];
    const rows = filtered.map((c) => [c.certificateNumber,c.name,c.cpf,c.registrationNumber,c.category,c.course,String(c.workload),c.startDate,c.endDate,c.issueDate,c.status].map((value) => `"${String(value).replace(/"/g, '""')}"`));
    const csv = '\uFEFF' + [headers.join(';'), ...rows.map((row) => row.join(';'))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SisCert_CVTE_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const MoreActions = ({ cert, mobile = false }: { cert: Certificate; mobile?: boolean }) => (
    <div className="relative">
      <button onClick={(e) => { e.stopPropagation(); setOpenActionsId(openActionsId === cert.id ? null : cert.id); }} title="Mais ações" className={`rounded-md text-gray-500 hover:bg-gray-100 ${mobile ? 'p-2.5' : 'p-2'}`}><MoreHorizontal className="h-4 w-4" /></button>
      {openActionsId === cert.id && <div className="absolute right-0 top-10 z-30 w-48 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-xl">
        <button onClick={(e) => { e.stopPropagation(); onOpenDetails(cert); setOpenActionsId(null); }} className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs text-gray-700 hover:bg-gray-50"><Eye className="h-3.5 w-3.5" />Visualizar detalhes</button>
        {cert.status === 'Emitido' && <button onClick={(e) => { e.stopPropagation(); onEditCertificate(cert); setOpenActionsId(null); }} className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs text-gray-700 hover:bg-gray-50"><Edit3 className="h-3.5 w-3.5" />Editar certificado</button>}
        <button onClick={(e) => { e.stopPropagation(); onReissueCertificate(cert); setOpenActionsId(null); }} className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs text-gray-700 hover:bg-gray-50"><RefreshCw className="h-3.5 w-3.5" />Reemitir certificado</button>
        {cert.status === 'Emitido' && <button onClick={(e) => { e.stopPropagation(); onCancelCertificate(cert); setOpenActionsId(null); }} className="flex w-full items-center gap-2 border-t border-gray-100 px-3 py-2.5 text-left text-xs text-red-600 hover:bg-red-50"><Ban className="h-3.5 w-3.5" />Cancelar certificado</button>}
      </div>}
    </div>
  );

  return (
    <div id="certificados-page" className="space-y-6 lg:space-y-8">
      <PageHeader id="certificados-header" title="Certificados" subtitle="Consulte, localize e gerencie os certificados CVTE emitidos pelo SisCert.">
        <ActionButton label="Exportar CSV" icon={FileSpreadsheet} variant="secondary" disabled={!filtered.length} onClick={handleExportCSV} className="flex-1 sm:flex-none" />
        <ActionButton label="Emitir certificado" icon={FilePlus2} variant="primary" onClick={() => onNavigate('emitir')} className="flex-1 sm:flex-none" />
      </PageHeader>

      {!!certificates.length && <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="rounded-xl border border-gray-200 bg-white px-3 py-3 shadow-sm sm:px-4"><p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 sm:text-[10px]">Total</p><p className="mt-1 text-lg font-bold text-gray-900 sm:text-xl">{certificates.length}</p></div>
        <div className="rounded-xl border border-emerald-100 bg-white px-3 py-3 shadow-sm sm:px-4"><p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 sm:text-[10px]">Emitidos</p><p className="mt-1 text-lg font-bold text-[#1B4332] sm:text-xl">{issuedCount}</p></div>
        <div className="rounded-xl border border-gray-200 bg-white px-3 py-3 shadow-sm sm:px-4"><p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 sm:text-[10px]">Cancelados</p><p className="mt-1 text-lg font-bold text-gray-700 sm:text-xl">{cancelledCount}</p></div>
      </div>}

      <section className="overflow-visible rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="space-y-3 border-b border-gray-100 p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <SearchInput id="certificados-search-input" value={searchTerm} disabled={!certificates.length} onChange={(value) => { setSearchTerm(value); setCurrentPage(1); }} placeholder="Buscar por nome, CPF, registro ou nº..." className="w-full lg:max-w-lg" />
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center"><select value={statusFilter} disabled={!certificates.length} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="min-w-0 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs"><option value="todos">Todos os status</option><option value="Emitido">Emitidos</option><option value="Cancelado">Cancelados</option></select><select value={categoryFilter} disabled={!certificates.length} onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }} className="min-w-0 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs"><option value="todos">Todas as categorias</option>{availableCategories.map((category) => <option key={category} value={category}>{category}</option>)}</select>{(searchTerm || statusFilter !== 'todos' || categoryFilter !== 'todos') && <button onClick={clearFilters} className="col-span-2 flex items-center justify-center gap-1 rounded-md px-2 py-2 text-xs font-semibold text-[#1B4332] hover:bg-emerald-50 sm:col-span-1"><X className="h-3.5 w-3.5" />Limpar filtros</button>}</div>
          </div>
          {!!certificates.length && <p className="text-[10px] leading-4 text-gray-400 sm:text-[11px]">O CPF permanece parcialmente oculto na listagem. A busca por CPF continua disponível.</p>}
        </div>

        {!certificates.length ? <div className="px-5 py-14 sm:px-6 sm:py-16"><EmptyState title="Nenhum certificado emitido" description="Os certificados CVTE emitidos aparecerão aqui para consulta e gerenciamento." actionText="Emitir primeiro certificado" onAction={() => onNavigate('emitir')} /></div> : (
          <>
            <div className="divide-y divide-gray-100 md:hidden">
              {paginated.length ? paginated.map((cert) => <article key={cert.id} onClick={() => onOpenDetails(cert)} className="p-4 active:bg-gray-50"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="font-mono text-xs font-bold text-[#1B4332]">{cert.certificateNumber}</p><h3 className="mt-1 truncate text-sm font-semibold text-gray-900">{cert.name}</h3><p className="mt-1 font-mono text-[10px] text-gray-400">Registro {cert.registrationNumber}</p></div><CertificateStatusBadge status={cert.status} size="sm" /></div><div className="mt-3 grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-3 text-[11px]"><div><span className="block text-gray-400">CPF</span><strong className="font-mono font-medium text-gray-600">{maskCpf(cert.cpf)}</strong></div><div><span className="block text-gray-400">Categoria</span><strong className="text-[#1B4332]">{cert.category}</strong></div><div className="col-span-2"><span className="block text-gray-400">Emissão</span><strong className="font-medium text-gray-700">{formatDateBR(cert.issueDate)}</strong></div></div><div className="mt-3 flex items-center justify-end gap-1 border-t border-gray-100 pt-3">{cert.status === 'Emitido' && <ActionButton label="Baixar PDF" icon={Download} variant="ghost" onClick={(e) => { e.stopPropagation(); onDownloadPDF(cert); }} className="px-2" />}<ActionButton label="Visualizar" icon={Eye} variant="ghost" onClick={(e) => { e.stopPropagation(); onViewCertificate(cert); }} className="px-2" /><MoreActions cert={cert} mobile /></div></article>) : <div className="py-12"><EmptyState title="Nenhum certificado localizado" description="Não há registros correspondentes aos filtros informados." /></div>}
            </div>

            <div className="hidden overflow-x-auto md:block"><table className="w-full text-left"><thead className="border-b border-gray-100 bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400"><tr><th onClick={() => toggleSort('certificateNumber')} className="cursor-pointer px-5 py-3"><span className="flex items-center gap-1">Nº Certificado <ArrowUpDown className="h-3 w-3" /></span></th><th onClick={() => toggleSort('name')} className="cursor-pointer px-5 py-3"><span className="flex items-center gap-1">Participante <ArrowUpDown className="h-3 w-3" /></span></th><th className="px-5 py-3">CPF</th><th className="px-5 py-3">Cat.</th><th onClick={() => toggleSort('issueDate')} className="cursor-pointer px-5 py-3"><span className="flex items-center gap-1">Emissão <ArrowUpDown className="h-3 w-3" /></span></th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Ações</th></tr></thead><tbody className="divide-y divide-gray-50 text-sm">{paginated.length ? paginated.map((cert) => <tr key={cert.id} onClick={(e) => { if (!(e.target as HTMLElement).closest('button')) onOpenDetails(cert); }} className="cursor-pointer transition-colors hover:bg-gray-50/80"><td className="whitespace-nowrap px-5 py-4 font-mono text-xs font-semibold text-[#1B4332]">{cert.certificateNumber}</td><td className="px-5 py-4"><div className="max-w-[250px] truncate font-semibold text-gray-900" title={cert.name}>{cert.name}</div><div className="mt-0.5 text-[10px] font-mono text-gray-400">Registro {cert.registrationNumber}</div></td><td className="whitespace-nowrap px-5 py-4 font-mono text-xs text-gray-500">{maskCpf(cert.cpf)}</td><td className="px-5 py-4"><span className="rounded border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-[#1B4332]">{cert.category}</span></td><td className="whitespace-nowrap px-5 py-4 text-xs text-gray-600">{formatDateBR(cert.issueDate)}</td><td className="px-5 py-4"><CertificateStatusBadge status={cert.status} size="sm" /></td><td className="px-5 py-4"><div className="flex items-center justify-end gap-1">{cert.status === 'Emitido' && <ActionButton label="Baixar PDF" icon={Download} variant="ghost" onClick={(e) => { e.stopPropagation(); onDownloadPDF(cert); }} />}<ActionButton label="Visualizar" icon={Eye} variant="ghost" onClick={(e) => { e.stopPropagation(); onViewCertificate(cert); }} /><MoreActions cert={cert} /></div></td></tr>) : <tr><td colSpan={7} className="py-12"><EmptyState title="Nenhum certificado localizado" description="Não há registros correspondentes aos filtros informados." /></td></tr>}</tbody></table></div>
          </>
        )}

        {!!certificates.length && <div className="flex flex-col gap-2 border-t border-gray-100 bg-gray-50 px-4 py-3 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-5"><span className="text-gray-500">{filtered.length ? `Mostrando ${firstResult}–${lastResult} de ${filtered.length}` : 'Nenhum resultado'}</span>{totalPages > 1 && <div className="grid grid-cols-2 gap-2 sm:flex"><ActionButton label="Anterior" variant="secondary" disabled={safePage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} /><ActionButton label="Próxima" variant="secondary" disabled={safePage === totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} /></div>}</div>}
      </section>
    </div>
  );
};