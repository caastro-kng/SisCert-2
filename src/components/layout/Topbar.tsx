import React from 'react';
import { NavigationPage } from '../../types';
import { FilePlus2, Menu } from 'lucide-react';

interface TopbarProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  onOpenMobileMenu: () => void;
  isCollapsed: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({ currentPage, onNavigate, onOpenMobileMenu, isCollapsed }) => {
  const getPageTitle = (page: NavigationPage) => {
    switch (page) {
      case 'dashboard': return 'Visão Geral';
      case 'emitir': return 'Emitir Certificado CVTE';
      case 'certificados': return 'Certificados';
      case 'detalhes': return 'Detalhes do Certificado';
      case 'auditoria': return 'Histórico';
      case 'configuracoes': return 'Configurações';
      default: return 'SisCert';
    }
  };

  return (
    <header id="app-topbar" className={`sticky top-0 z-30 flex h-14 items-center justify-between border-b border-gray-200 bg-white/95 px-3 backdrop-blur transition-all duration-300 sm:h-16 sm:px-6 lg:px-8 ${isCollapsed ? 'lg:pl-24' : 'lg:pl-68'}`}>
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button onClick={onOpenMobileMenu} className="shrink-0 rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 lg:hidden" aria-label="Abrir menu lateral"><Menu className="h-5 w-5" /></button>
        <div className="min-w-0 sm:hidden"><p className="truncate text-sm font-semibold text-gray-900">{getPageTitle(currentPage)}</p></div>
        <div className="hidden items-center gap-2 text-sm text-gray-500 sm:flex"><span>SisCert</span><span className="text-gray-300">/</span><span className="font-medium text-gray-900">{getPageTitle(currentPage)}</span></div>
      </div>

      {currentPage !== 'emitir' && (
        <button onClick={() => onNavigate('emitir')} className="flex shrink-0 items-center gap-2 rounded-md bg-[#1B4332] px-3 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-[#2D5A47] sm:px-4"><FilePlus2 className="h-4 w-4 text-[#D4AF37]" /><span className="hidden xs:inline sm:inline">Novo Certificado</span><span className="sm:hidden">Novo</span></button>
      )}
    </header>
  );
};
