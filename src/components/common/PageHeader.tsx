import React from "react";

type Props = {
  title?: string;
  subtitle?: React.ReactNode;
  headerRight?: React.ReactNode;
  children?: React.ReactNode;
};

export function PageHeader({ title, subtitle, headerRight, children }: Props) {
  if (!title && !subtitle && !headerRight && !children) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
      <div className="flex-1">
        {title && <h1 className="text-3xl font-bold text-slate-900 mb-2">{title}</h1>}
        {subtitle && <div className="text-slate-600">{subtitle}</div>}
        {children}
      </div>
      {headerRight && (
        <div className="flex items-center gap-3 flex-shrink-0">
          {headerRight}
        </div>
      )}
    </div>
  );
}

export default PageHeader;
