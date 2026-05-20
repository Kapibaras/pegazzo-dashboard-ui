import { CircleCheck } from 'lucide-react';

const AutorizacionesEmptyState = () => {
  return (
    <div className="border-secondary-100/80 flex flex-col items-center justify-center gap-3 rounded-lg border bg-white px-6 py-16 text-center shadow-sm">
      <div className="bg-success-50 flex h-16 w-16 items-center justify-center rounded-full">
        <CircleCheck className="text-success-600 h-9 w-9" strokeWidth={1.75} />
      </div>
      <h2 className="typo-subtitle text-carbon-500">No hay transacciones pendientes</h2>
      <p className="typo-text text-carbon-300 max-w-md">Todas las transacciones han sido revisadas.</p>
    </div>
  );
};

export default AutorizacionesEmptyState;
