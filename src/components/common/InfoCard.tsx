import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type InfoRow = {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  /** Long text (an address): spans the whole row and wraps instead of being cut with an ellipsis. */
  wide?: boolean;
};

type InfoCardProps = {
  icon: LucideIcon;
  title: string;
  rows: InfoRow[];
  badge?: React.ReactNode;
  chipClassName?: string;
  className?: string;
};

/** Section card of the detail page: icon chip + title (+ optional badge) and a label/value list. */
const InfoCard = ({ icon: Icon, title, rows, badge, chipClassName, className }: InfoCardProps) => (
  <section
    className={cn(
      'border-surface-600/70 flex flex-col gap-4 rounded-xl border bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]',
      className,
    )}
  >
    <header className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'bg-primary-50 text-primary-800 flex size-9 items-center justify-center rounded-lg',
            chipClassName,
          )}
        >
          <Icon className="size-[18px]" aria-hidden />
        </span>
        <h2 className="typo-subtitle text-carbon-500">{title}</h2>
      </div>
      {badge}
    </header>

    <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
      {rows.map((row) => (
        <div key={row.label} className={cn('flex min-w-0 flex-col gap-0.5', row.wide && 'sm:col-span-2')}>
          <dt className="typo-caption text-carbon-300">{row.label}</dt>
          <dd
            className={cn(
              'typo-sm-text text-carbon-500',
              row.wide ? 'break-words' : 'truncate',
              row.mono && 'font-numbers',
            )}
          >
            {row.value || '—'}
          </dd>
        </div>
      ))}
    </dl>
  </section>
);

export default InfoCard;
