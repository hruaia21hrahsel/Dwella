import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

type Props = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  className?: string;
  iconClassName?: string;
};

export function StatCard({ title, value, icon: Icon, description, className, iconClassName }: Props) {
  return (
    <div className={cn('rounded-lg border bg-card p-5 shadow-sm', className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className={cn('rounded-md p-2', iconClassName ?? 'bg-primary/10')}>
          <Icon className={cn('h-4 w-4', iconClassName ? 'text-white' : 'text-primary')} />
        </div>
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
      {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
    </div>
  );
}
