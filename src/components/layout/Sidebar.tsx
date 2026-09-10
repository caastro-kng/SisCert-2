import React from 'react';
import { NavigationPage } from '../../types';
import {
  LayoutDashboard,
  FilePlus2,
  FileText,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  BadgeCheck
} from 'lucide-react';

interface SidebarProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  certificatesCount?: number;
  operatorName?: string;
  operatorRank?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  certificatesCount = 0,
  operatorName = 'Operador Admin',
  operatorRank = 'Militar',
}) => {
  const navItems = [
    { id: 'dashboard' as NavigationPage, label: 'Visão Geral', icon: LayoutDashboard, badge: null },
    { id: 'emitir' as NavigationPage, label: 'Emitir Certificado', icon: FilePlus2, badge: 'Novo' },
    { id: 'certificados' as NavigationPage, label: 'Certificados', icon: FileText, badge: certificatesCount > 0 ? String(certificatesCount) : null },
    { id: 'auditoria' as NavigationPage, label: 'Histórico', icon: History, badge: null },
    { id: 'configuracoes' as NavigationPage, label: 'Configurações', icon: Settings, badge: null },
  ];

  const handleSelect = (page: NavigationPage) => {
    onNavigate(page);
    onCloseMobile();
  };

  const initials = operatorName.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'OP';

  return (
    <>
      {isMobileOpen && <div id="sidebar-mobile-backdrop" onClick={onCloseMobile} className="fixed inset-0 z-40 bg-stone-950/55 backdrop-blur-[3px] lg:hidden" />}

      <aside
        id="app-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-[86vw] max-w-[300px] flex-col justify-between border-r border-white/10 bg-[#12372A] text-white shadow-2xl transition-all duration-300 ease-out lg:z-40 lg:max-w-none lg:shadow-none ${isCollapsed ? 'lg:w-20' : 'lg:w-64'} ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="relative flex items-center gap-3 overflow-hidden border-b border-white/10 p-4 sm:p-5">
          <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-[#C6A15B]/10 blur-2xl" />
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#C6A15B]/35 bg-gradient-to-br from-[#C6A15B] to-[#B78E43] shadow-[0_8px_20px_rgba(0,0,0,.18)]">
            <BadgeCheck className="h-5 w-5 text-[#12372A]" strokeWidth={2.2} />
          </div>
          <div className={`${isCollapsed ? 'lg:hidden' : ''} relative min-w-0 flex flex-col`}>
            <span className="text-base font-extrabold leading-tight tracking-[-0.02em] text-white">SisCert</span>
            <span className="text-[9px] font-semibold uppercase tracking-[0.21em] text-[#C6A15B]">Certificados CVTE</span>
          </div>
        </div>

        <div className="flex-1 space-y-1.5 overflow-y-auto px-3 py-5">
          <p className={`${isCollapsed ? 'lg:hidden' : ''} mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-white/35`}>Menu principal</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => handleSelect(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`group relative flex w-full items-center gap-3 overflow-hidden rounded-lg px-3.5 py-2.5 text-left text-sm font-medium transition-all duration-200 ${isActive ? 'bg-white/10 font-semibold text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,.05)]' : 'text-white/72 hover:bg-white/[0.07] hover:text-white'} ${isCollapsed ? 'lg:justify-center lg:px-2' : ''}`}
              >
                <span className={`absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-[#C6A15B] transition-all duration-200 ${isActive ? 'translate-x-0 opacity-100' : '-translate-x-1 opacity-0'}`} />
                <Icon className={`h-[18px] w-[18px] shrink-0 transition-all duration-200 group-hover:-translate-y-0.5 ${isActive ? 'text-[#C6A15B]' : 'text-white/65 group-hover:text-white'}`} />
                <span className={`${isCollapsed ? 'lg:hidden' : ''} flex-1 truncate`}>{item.label}</span>
                {item.badge && <span className={`${isCollapsed ? 'lg:hidden' : ''} rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${isActive ? 'bg-[#C6A15B]/15 text-[#E3C887]' : 'bg-white/10 text-white/75'}`}>{item.badge}</span>}
              </button>
            );
          })}
        </div>

        <div className="space-y-3 border-t border-white/10 p-4">
          <div className={`${isCollapsed ? 'lg:justify-center' : ''} flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.035] px-2.5 py-2`}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#C6A15B]/25 bg-[#C6A15B]/10 text-xs font-bold text-[#E3C887]">{initials}</div>
            <div className={`${isCollapsed ? 'lg:hidden' : ''} min-w-0`}>
              <p className="truncate text-xs font-bold text-white">{operatorName}</p>
              <p className="truncate text-[10px] text-white/50">{operatorRank}</p>
            </div>
          </div>

          <button id="btn-toggle-sidebar" onClick={onToggleCollapse} className="hidden w-full items-center justify-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium text-white/50 transition-all hover:bg-white/[0.06] hover:text-white lg:flex">
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4" /><span>Recolher menu</span></>}
          </button>
        </div>
      </aside>
    </>
  );
};
