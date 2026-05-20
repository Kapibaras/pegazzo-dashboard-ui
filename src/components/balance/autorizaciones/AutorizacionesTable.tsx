'use client';

import { Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TRANSACTION_TYPE_LABELS } from '@/lib/transaction';
import { cn } from '@/lib/utils';
import { Transaction } from '@/types/transaction';
import { formatCurrency } from '@/utils/formatters';
import { formatLongDatetime } from '@/utils/datetime/date';

interface AutorizacionesTableProps {
  transactions: Transaction[];
  pendingByRef: Set<string>;
  disabled?: boolean;
  onApprove: (reference: string) => void;
  onReject: (reference: string) => void;
}

const HEADERS = ['Referencia', 'Fecha', 'Tipo', 'Monto', 'Categoría', 'Acciones'];

const AutorizacionesTable = ({
  transactions,
  pendingByRef,
  disabled = false,
  onApprove,
  onReject,
}: AutorizacionesTableProps) => {
  return (
    <TooltipProvider delayDuration={150}>
      <div className="border-secondary-100/80 min-w-0 overflow-hidden rounded-lg border shadow-sm">
        <Table>
          <TableHeader className="border-primary-700/20 from-secondary-500 to-secondary-600 border-b bg-gradient-to-b">
            <TableRow className="hover:bg-transparent">
              {HEADERS.map((label) => (
                <TableHead key={label} className="px-5 py-3 lg:px-6">
                  <span className="text-primary-100 typo-bold-text">{label}</span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction, index) => {
              const isCredit = transaction.type === 'credit';
              const isBusy = disabled || pendingByRef.has(transaction.reference);
              return (
                <TableRow
                  key={transaction.reference}
                  className={cn(
                    'border-secondary-100/50 transition-colors duration-150',
                    index % 2 === 0 ? 'bg-white' : 'bg-surface-300/50',
                  )}
                >
                  <TableCell className="px-5 py-3.5 lg:px-6">
                    <span className="typo-bold-text text-primary-600 font-mono">{transaction.reference}</span>
                  </TableCell>
                  <TableCell className="px-5 py-3.5 lg:px-6">
                    <span className="font-numbers">{formatLongDatetime(transaction.date)}</span>
                  </TableCell>
                  <TableCell className="px-5 py-3.5 lg:px-6">
                    <Badge
                      className={cn(
                        'text-xs font-medium',
                        isCredit
                          ? 'bg-success-50 text-success-700 hover:bg-success-50'
                          : 'bg-error-50 text-error-700 hover:bg-error-50',
                      )}
                    >
                      {TRANSACTION_TYPE_LABELS[transaction.type] ?? transaction.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-5 py-3.5 lg:px-6">
                    <span className={cn('font-numbers font-medium', isCredit ? 'text-success-700' : 'text-error-700')}>
                      {isCredit ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </span>
                  </TableCell>
                  <TableCell className="px-5 py-3.5 lg:px-6">
                    <span className="typo-text text-carbon-400">{transaction.category ?? '—'}</span>
                  </TableCell>
                  <TableCell className="px-5 py-3.5 lg:px-6">
                    <div className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon-sm"
                            disabled={isBusy}
                            onClick={() => onApprove(transaction.reference)}
                            className="bg-success-100 text-success-700 hover:bg-success-200 hover:text-success-800 cursor-pointer"
                            aria-label={`Aprobar ${transaction.reference}`}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Aprobar</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon-sm"
                            disabled={isBusy}
                            onClick={() => onReject(transaction.reference)}
                            className="bg-error-100 text-error-700 hover:bg-error-200 hover:text-error-800 cursor-pointer"
                            aria-label={`Rechazar ${transaction.reference}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Rechazar</TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
};

export default AutorizacionesTable;
