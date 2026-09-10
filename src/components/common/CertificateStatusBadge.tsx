import React from 'react';

interface CertificateStatusBadgeProps {
  status: 'Emitido' | 'Cancelado';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CertificateStatusBadge: React.FC<CertificateStatusBadgeProps> = ({
  status,
  size = 'md',
  className = '',
}) => {
  const isEmitido = status === 'Emitido';

  return (
    <span
      id={`status-badge-${status.toLowerCase()}`}
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
        isEmitido
          ? 'bg-green-50 text-green-700'
          : 'bg-red-50 text-red-700'
      } ${className}`}
    >
      {status}
    </span>
  );
};
