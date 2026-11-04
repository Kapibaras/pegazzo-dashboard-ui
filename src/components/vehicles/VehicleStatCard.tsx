import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type VehicleStatCardProps = {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  chipClassName: string;
};

const VehicleStatCard = ({ icon: Icon, label, value, hint, chipClassName }: VehicleStatCardProps) => (
  <div className="border-surface-600/70 flex flex-col justify-between gap-3 rounded-xl border bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-md">
    <div className="flex items-center gap-2.5">
      <span className={cn('flex size-8 items-center justify-center rounded-lg', chipClassName)}>
        <Icon className="size-4" aria-hidden />
      </span>
      <span className="typo-caption text-carbon-300">{label}</span>
    </div>
    <div className="min-w-0">
      <p className="typo-kpi-sm text-carbon-500 truncate">{value}</p>
      {hint && <p className="typo-caption text-carbon-300 mt-0.5 truncate">{hint}</p>}
    </div>
  </div>
);

export default VehicleStatCard;
