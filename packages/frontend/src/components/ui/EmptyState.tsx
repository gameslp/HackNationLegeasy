import { ReactNode } from 'react';
import { FileX, Search, AlertCircle, Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: 'file' | 'search' | 'alert' | 'inbox';
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

const icons = {
  file: FileX,
  search: Search,
  alert: AlertCircle,
  inbox: Inbox,
};

export function EmptyState({
  icon = 'inbox',
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  const Icon = icons[icon];

  return (
    <div
      className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}
    >
      <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4 shadow-inner">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-500 max-w-md mb-6">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
