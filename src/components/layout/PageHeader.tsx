import React from 'react';

interface PageHeaderProps {
  id?: string;
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  id = 'page-header',
  title,
  subtitle,
  children,
}) => {
  return (
    <div id={id} className="flex flex-col gap-4 pb-2 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <div className="min-w-0">
        <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
          {title}
        </h1>
        <p className="mt-1 max-w-2xl text-xs leading-5 text-gray-500 sm:text-sm sm:leading-6">
          {subtitle}
        </p>
      </div>

      {children && (
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:shrink-0 sm:justify-end">
          {children}
        </div>
      )}
    </div>
  );
};
