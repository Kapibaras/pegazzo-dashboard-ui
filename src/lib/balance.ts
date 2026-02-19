import { BALANCE_PERIODS, BalanceMetricsParams, BalancePeriodType, DEFAULT_PERIOD } from '@/types/balance';

export const PERIOD_LABELS: Record<BalancePeriodType, string> = {
  week: 'Semana',
  month: 'Mes',
  year: 'Año',
};

export const parsePeriod = (value: string | undefined): BalancePeriodType => {
  if (value && (BALANCE_PERIODS as readonly string[]).includes(value)) {
    return value as BalancePeriodType;
  }
  return DEFAULT_PERIOD;
};

const getISOWeekNumber = (date: Date): number => {
  const target = new Date(date.valueOf());
  target.setHours(0, 0, 0, 0);
  target.setDate(target.getDate() + 3 - ((target.getDay() + 6) % 7));
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  firstThursday.setDate(firstThursday.getDate() + 3 - ((firstThursday.getDay() + 6) % 7));
  return 1 + Math.round((target.getTime() - firstThursday.getTime()) / (7 * 24 * 60 * 60 * 1000));
};

export const periodToApiParams = (period: BalancePeriodType): BalanceMetricsParams => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  switch (period) {
    case 'week':
      return { period, week: getISOWeekNumber(now), month, year };
    case 'month':
      return { period, month, year };
    case 'year':
      return { period, year };
  }
};

const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const formatDateDMY = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
};

const getWeekMonday = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  d.setHours(0, 0, 0, 0);
  return d;
};

const getWeekSunday = (monday: Date): Date => {
  const d = new Date(monday);
  d.setDate(d.getDate() + 6);
  return d;
};

export const periodSubtitle = (period: BalancePeriodType): string => {
  const now = new Date();
  const monthName = MONTH_NAMES[now.getMonth()];
  const year = now.getFullYear();

  switch (period) {
    case 'week': {
      const monday = getWeekMonday(now);
      const sunday = getWeekSunday(monday);
      const weekOfMonth =
        monday.getMonth() === now.getMonth() ? Math.floor((monday.getDate() - 1) / 7) + 1 : 1;
      return `Métricas de la Semana ${weekOfMonth} de ${monthName} (${formatDateDMY(monday)} - ${formatDateDMY(sunday)})`;
    }
    case 'month':
      return `Métricas del mes de ${monthName} ${year}`;
    case 'year':
      return `Métricas del año ${year}`;
  }
};
