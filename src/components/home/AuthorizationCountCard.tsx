'use client';

import Link from 'next/link';
import { ArrowUpRight, type LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type Tone = 'warning' | 'error';

interface AuthorizationCountCardProps {
  title: string;
  description?: string;
  href: string;
  count: number | null;
  loading?: boolean;
  icon: LucideIcon;
  tone: Tone;
}

const TONE_CLASSES: Record<Tone, { iconBg: string; iconText: string; countText: string }> = {
  warning: {
    iconBg: 'bg-warning-100',
    iconText: 'text-warning-700',
    countText: 'text-warning-700',
  },
  error: {
    iconBg: 'bg-error-100',
    iconText: 'text-error-700',
    countText: 'text-error-700',
  },
};

const AuthorizationCountCard = ({
  title,
  description,
  href,
  count,
  loading,
  icon: Icon,
  tone,
}: AuthorizationCountCardProps) => {
  const tones = TONE_CLASSES[tone];

  return (
    <Link
      href={href}
      className="group focus-visible:ring-primary-400 rounded-xl outline-none focus-visible:ring-2"
      aria-label={title}
    >
      <Card className="cursor-pointer transition-shadow duration-200 group-hover:shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={cn('flex size-10 items-center justify-center rounded-lg', tones.iconBg)}>
                <Icon className={cn('size-5', tones.iconText)} />
              </div>
              <CardTitle className="typo-subtitle">{title}</CardTitle>
            </div>
            <ArrowUpRight className="text-carbon-200 size-5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-3">
            {loading || count === null ? (
              <Skeleton className="h-10 w-16" />
            ) : (
              <span className={cn('font-numbers text-4xl font-semibold tracking-tight', tones.countText)}>{count}</span>
            )}
            {description && <span className="typo-sm-text text-carbon-300">{description}</span>}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default AuthorizationCountCard;
