import React, { useState } from 'react';
import { InstitutionConfig } from '../types';
import { PageHeader } from '../components/layout/PageHeader';
import { ActionButton } from '../components/common/ActionButton';
import { User, Save, CheckCircle2 } from 'lucide-react';

interface ConfiguracoesPageProps {
  config: InstitutionConfig;
  onSaveConfig: (updated: InstitutionConfig) => void;
}

export const ConfiguracoesPage: React.FC<ConfiguracoesPageProps> = ({ config, onSaveConfig }) => {
  const [name, setName] = useState(config.operatorName || '');
  const [rank, setRank] = useState(config.operatorRank || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({ ...config, operatorName: name.trim(), operatorRank: rank.trim() });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div id="configuracoes-page" className="mx-auto max-w-3xl space-y-6 lg:space-y-8">
      <PageHeader id="configuracoes-header" title="Configurações" subtitle="Edite as informações do usuário responsável pela operação do SisCert." />

      {savedSuccess && <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-900 sm:items-center sm:p-4 sm:text-sm"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 sm:mt-0" /><span>Dados do usuário salvos com sucesso.</span></div>}

      <form onSubmit={handleSubmit} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-start gap-3 border-b border-gray-100 p-4 sm:items-center sm:p-6"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1B4332]/10"><User className="h-5 w-5 text-[#1B4332]" /></div><div><h3 className="text-sm font-bold text-gray-900">Perfil do usuário</h3><p className="mt-0.5 text-xs leading-5 text-gray-500">Essas informações identificam o operador no sistema e no histórico de ações.</p></div></div>
        <div className="space-y-5 p-4 sm:p-6"><div><label htmlFor="operator-name" className="mb-1.5 block text-xs font-semibold text-gray-700">Nome</label><input id="operator-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Digite o nome do usuário" className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 transition focus:border-[#1B4332] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4332]/15" /></div><div><label htmlFor="operator-rank" className="mb-1.5 block text-xs font-semibold text-gray-700">Posto / Graduação</label><input id="operator-rank" type="text" value={rank} onChange={(e) => setRank(e.target.value)} placeholder="Ex.: 3º Sgt, 2º Ten, Cap" className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 transition focus:border-[#1B4332] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4332]/15" /></div></div>
        <div className="border-t border-gray-100 bg-gray-50 p-4 sm:flex sm:justify-end sm:px-6"><ActionButton type="submit" label="Salvar alterações" icon={Save} variant="primary" size="md" disabled={!name.trim() || !rank.trim()} fullWidth className="sm:w-auto" /></div>
      </form>
    </div>
  );
};
