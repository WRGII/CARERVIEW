import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

type Crumb = {
  label: string;
  to?: string;
};

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm mb-4">
      <Link to="/caregiver" className="text-slate-500 hover:text-cyan-600 transition-colors">
        <Home className="w-4 h-4" />
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          {item.to ? (
            <Link to={item.to} className="text-slate-500 hover:text-cyan-600 transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-800 font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
