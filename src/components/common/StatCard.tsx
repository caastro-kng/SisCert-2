import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  id: string;
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  accentColor?: 'green' | 'gold' | 'neutral';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  id,
  title,
  value,
  subtitle,
  icon: Icon,
  accentColor = 'green',
  onClick,
}) => {
  const accentStyles = {
    green: 'text-[#1B4332] bg-[#E9F3EE] border-emerald-100',
    gold: 'text-[#9A7738] bg-[#F7F0DF] border-[#E8D7AF]',
    neutral: 'text-gray-700 bg-gray-50 border-gray-100',
  };

  const trendStyles = {
    green: 'text-[#2D6A4F]',
    gold: 'text-[#9A7738]',
    neutral: 'text-gray-400',
  };

  return (
    <div
      id={id}
      onClick={onClick}
      className={`sis-card sis-reveal group relative flex items-center justify-between overflow-hidden rounded-xl border bg-white/95 p-5 backdrop-blur-sm ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#C6A15B]/65 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
      <div className="flex min-w-0 flex-col">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
          {title}
        </p>
        <h2 className="text-3xl font-extrabold tracking-[-0.03em] text-[#18201C]">
          {value}
        </h2>
        {subtitle && (
          <div className={`mt-2 flex items-center gap-1 text-[11px] font-medium ${trendStyles[accentColor]}`}>
            <span>{subtitle}</span>
          </div>
        )}
      </div>

      <div className={`sis-icon-lift shrink-0 rounded-xl border p-3 shadow-sm ${accentStyles[accentColor]}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
};
