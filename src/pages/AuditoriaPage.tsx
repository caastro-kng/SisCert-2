import React, { useMemo, useState } from 'react';
import { AuditLog } from '../types';
import { PageHeader } from '../components/layout/PageHeader';
import { SearchInput } from '../components/common/SearchInput';
import { EmptyState } from '../components/common/EmptyState';
import { Ban, Download, Edit3, FilePlus2, FileText, History, RefreshCw, Search, User } from 'lucide-react';

interface AuditoriaPageProps {
  logs: AuditLog[];
}

const actionMeta = (action: AuditLog['action']) => {
  switch (action) {
    case 'Certificado criado':
      return { label: 'Emissão', icon: FilePlus2, iconClass: 'text-emerald-700', bubbleClass: 'bg-emerald-50 border-emerald-100' };
    case 'Certificado editado':
      return { label: 'Edição', icon: Edit3, iconClass: 'text-amber-700', bubbleClass: 'bg-amber-50 border-amber-100' };
    case 'PDF gerado':
      return { label: 'PDF', icon: Download, iconClass: 'text-blue-700', bubbleClass: 'bg-blue-50 border-blue-100' };
    case 'Certificado reemitido':
      return { label: 'Reemissão', icon: RefreshCw, iconClass: 'text-violet-700', bubbleClass: 'bg-violet-50 border-violet-100' };
    case 'Certificado cancelado':
      return { label: 'Cancelamento', icon: Ban, iconClass: 'text-red-700', bubbleClass: 'bg-red-50 border-red-100' };
    default:
      return { label: 'Atividade', icon: FileText, iconClass: 'text-gray-600', bubbleClass: 'bg-gray-50 border-gray-100' };
  }
};

const dateKey = (timestamp: string) => new Date(timestamp).toLocaleDateString('pt-BR');

const dateLabel = (timestamp: string) => {
  const d = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Hoje';
  if (d.toDateString() === yesterday.toDateString()) return 'Ontem';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
};

export const AuditoriaPage: React.FC<AuditoriaPageProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('todos');

  const filteredLogs = useMemo(() => logs.filter((log) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = !term || log.details.toLowerCase().includes(term) || log.user.toLowerCase().includes(term) || log.certificateNumber.toLowerCase().includes(term);
    return matchesSearch && (actionFilter === 'todos' || log.action === actionFilter);
  }), [logs, searchTerm, actionFilter]);

  const grouped = useMemo(() => {
    const map = new Map<string, AuditLog[]>();
    filteredLogs.forEach((log) => {
      const key = dateKey(log.timestamp);
      map.set(key, [...(map.get(key) || []), log]);
    });
    return Array.from(map.entries());
  }, [filteredLogs]);

  const emittedCount = logs.filter((log) => log.action === 'Certificado criado').length;
  const pdfCount = logs.filter((log) => log.action === 'PDF gerado').length;
  const cancelledCount = logs.filter((log) => log.action === 'Certificado cancelado').length;

  return (
    <div id="historico-page" className="space-y-6 lg:space-y-8">
      <PageHeader id="historico-header" title="Histórico" subtitle="Acompanhe de forma simples as principais ações realizadas no SisCert." />

      {!!logs.length && <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"><p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Atividades</p><p className="mt-1 text-xl font-bold text-gray-900">{logs.length}</p></div>
        <div className="rounded-xl border border-emerald-100 bg-white p-4 shadow-sm"><p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Emissões</p><p className="mt-1 text-xl font-bold text-[#1B4332]">{emittedCount}</p></div>
        <div className="rounded-xl border border-blue-100 bg-white p-4 shadow-sm"><p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">PDFs</p><p className="mt-1 text-xl font-bold text-blue-700">{pdfCount}</p></div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"><p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Cancelamentos</p><p className="mt-1 text-xl font-bold text-gray-700">{cancelledCount}</p></div>
      </div>}

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <SearchInput id="history-search" value={searchTerm} disabled={logs.length === 0} onChange={setSearchTerm} placeholder="Buscar por usuário, certificado ou detalhe..." className={`w-full sm:max-w-md ${logs.length === 0 ? 'pointer-events-none opacity-60' : ''}`} />
          <select id="history-action-filter" value={actionFilter} disabled={logs.length === 0} onChange={(e) => setActionFilter(e.target.value)} className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 disabled:opacity-60 sm:w-auto">
            <option value="todos">Todas as ações</option>
            <option value="Certificado criado">Emissões</option>
            <option value="Certificado editado">Edições</option>
            <option value="PDF gerado">Downloads de PDF</option>
            <option value="Certificado reemitido">Reemissões</option>
            <option value="Certificado cancelado">Cancelamentos</option>
          </select>
        </div>

        {logs.length === 0 ? (
          <div className="px-6 py-16"><EmptyState title="Nenhuma atividade registrada" description="As ações realizadas no SisCert aparecerão aqui automaticamente." /></div>
        ) : filteredLogs.length === 0 ? (
          <div className="px-6 py-14 text-center"><div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100 text-gray-500"><Search className="h-5 w-5" /></div><h3 className="mt-3 text-sm font-bold text-gray-900">Nenhuma atividade localizada</h3><p className="mt-1 text-xs text-gray-500">Tente alterar a busca ou o filtro selecionado.</p><button onClick={() => { setSearchTerm(''); setActionFilter('todos'); }} className="mt-3 text-xs font-semibold text-[#1B4332] hover:underline">Limpar filtros</button></div>
        ) : (
          <div className="p-4 sm:p-5 lg:p-6">
            <div className="space-y-7">
              {grouped.map(([key, dayLogs]) => <div key={key}>
                <div className="mb-3 flex items-center gap-3"><span className="text-xs font-bold text-gray-900">{dateLabel(dayLogs[0].timestamp)}</span><div className="h-px flex-1 bg-gray-100" /><span className="text-[10px] text-gray-400">{dayLogs.length} atividade{dayLogs.length === 1 ? '' : 's'}</span></div>
                <div className="space-y-2.5">
                  {dayLogs.map((log) => {
                    const meta = actionMeta(log.action);
                    const Icon = meta.icon;
                    return <article key={log.id} className="group rounded-xl border border-gray-100 bg-gray-50/45 p-3.5 transition-colors hover:border-gray-200 hover:bg-white sm:p-4">
                      <div className="flex items-start gap-3">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${meta.bubbleClass}`}><Icon className={`h-4 w-4 ${meta.iconClass}`} /></div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0"><p className="text-xs font-bold text-gray-900 sm:text-sm">{meta.label} · <span className="font-mono text-[#1B4332]">{log.certificateNumber || 'Sem número'}</span></p><p className="mt-1 text-xs leading-5 text-gray-600">{log.details}</p></div>
                            <time className="shrink-0 font-mono text-[10px] text-gray-400">{new Date(log.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</time>
                          </div>
                          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-gray-400"><User className="h-3 w-3" /><span className="truncate">{log.user}</span></div>
                        </div>
                      </div>
                    </article>;
                  })}
                </div>
              </div>)}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
