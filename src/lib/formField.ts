import { cn } from '@/lib/utils';

/**
 * Look of form controls (inputs, select triggers, comboboxes, textareas), the same one used by the transactions form
 * (`TransactionForm`): `surface-400` background, a clearly visible `surface-700` border, 18px text and generous padding.
 * Keep new forms on these helpers so every form in the dashboard looks alike.
 */
const FIELD_BASE =
  'border-surface-700 bg-surface-400 flex items-center self-stretch rounded-md border px-4.5 py-5.5 shadow-sm placeholder:text-left focus:border-blue-600 focus:outline-none';

/**
 * Classes for a single-line control. `mono` swaps the typography for `typo-numbers` (Source Code Pro): `typo-*` classes
 * are unlayered CSS, so they win over Tailwind's `font-numbers` utility and the font has to come from the same family.
 */
export const fieldClass = (options: { mono?: boolean; className?: string } = {}) =>
  cn(FIELD_BASE, options.mono ? 'typo-numbers' : 'typo-text', options.className);

export const TEXTAREA_CLASS =
  'typo-text border-surface-700 bg-surface-400 self-stretch rounded-md border px-4.5 py-3 shadow-sm placeholder:text-left focus:border-blue-600 focus:outline-none';
