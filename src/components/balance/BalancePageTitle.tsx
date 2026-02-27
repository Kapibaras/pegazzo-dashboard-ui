'use client';

import { usePathname } from 'next/navigation';

const TITLES: Record<string, string> = {
  '/balance/transacciones': 'Transacciones',
  '/balance': 'Métricas Actuales del Balance',
};

const BalancePageTitle = () => {
  const pathname = usePathname();
  const title = TITLES[pathname] ?? 'Balance';

  return <h1 className="typo-title">{title}</h1>;
};

export default BalancePageTitle;
