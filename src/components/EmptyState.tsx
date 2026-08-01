import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  hint?: string;
  className?: string;
}

export function EmptyState({ icon, title, hint, className = '' }: EmptyStateProps) {
  return (
    <div className={`empty-state empty-state--panel ${className}`.trim()}>
      {icon && (
        <span className="empty-state__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <p className="empty-state__title">{title}</p>
      {hint && <p className="empty-state__hint">{hint}</p>}
    </div>
  );
}
