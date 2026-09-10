import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  id?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  id = 'search-input',
  value,
  onChange,
  placeholder = 'Buscar por nome, CPF ou número do certificado...',
  className = '',
}) => {
  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-gray-100 border-none rounded-full pl-9 pr-9 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B4332] transition-all"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 text-gray-400 hover:text-gray-700 p-0.5 rounded transition-colors"
          aria-label="Limpar busca"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
