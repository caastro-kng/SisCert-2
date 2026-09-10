import React from 'react';
import { LucideIcon, LoaderCircle } from 'lucide-react';

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'dark';
  size?: 'sm' | 'md';
  loading?: boolean;
  loadingLabel?: string;
  fullWidth?: boolean;
}

const variants = {
  primary: 'bg-[#12372A] text-white hover:bg-[#1B4332] border border-[#12372A] shadow-sm hover:shadow-md focus:ring-[#C6A15B]/35',
  secondary: 'bg-white text-gray-700 hover:bg-[#F6F8F5] border border-[#E3E9E5] focus:ring-gray-200',
  ghost: 'bg-transparent text-gray-600 hover:bg-[#E9F3EE] hover:text-[#12372A] border border-transparent focus:ring-gray-200',
  danger: 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 focus:ring-red-200',
  dark: 'bg-gray-800 text-gray-100 hover:bg-gray-700 border border-gray-700 focus:ring-gray-600/40',
};

const sizes = {
  sm: 'px-3 py-2 text-xs',
  md: 'px-4 py-2.5 text-xs',
};

export const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  icon: Icon,
  variant = 'secondary',
  size = 'sm',
  loading = false,
  loadingLabel = 'Processando...',
  fullWidth = false,
  disabled,
  className = '',
  type = 'button',
  ...props
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={`inline-flex items-center justify-center gap-1.5 rounded-md font-semibold transition-all duration-200 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : Icon ? <Icon className={`h-4 w-4 transition-transform duration-200 ${variant === 'primary' ? 'text-[#C6A15B]' : ''}`} /> : null}
      <span>{loading ? loadingLabel : label}</span>
    </button>
  );
};
