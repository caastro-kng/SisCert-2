import React from 'react';
import { LucideIcon, FileQuestion } from 'lucide-react';

interface EmptyStateProps {
  id?: string;
  title: string;
  description: string;
  icon?: LucideIcon;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  id = 'empty-state',
  title,
  description,
  icon: Icon = FileQuestion,
  actionText,
  onAction,
}) => {
  return (
    <div
      id={id}
      className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white border border-gray-200 rounded-lg max-w-lg mx-auto"
    >
      <div className="w-12 h-12 rounded bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base sm:text-lg font-bold text-gray-900">
        {title}
      </h3>
      <p className="text-sm text-gray-500 mt-1.5 max-w-sm leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <button
          id={`${id}-action-btn`}
          onClick={onAction}
          className="mt-5 px-4 py-2 bg-[#1B4332] hover:bg-[#2D5A47] text-white text-sm font-medium rounded shadow-xs transition-colors cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
