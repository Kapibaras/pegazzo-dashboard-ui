'use client';

import { Suspense } from 'react';
import PeriodSelector from './PeriodSelector';

const BalanceFilters = () => {
  return (
    <div className="flex items-center gap-3">
      <Suspense>
        <PeriodSelector />
      </Suspense>
    </div>
  );
};

export default BalanceFilters;
