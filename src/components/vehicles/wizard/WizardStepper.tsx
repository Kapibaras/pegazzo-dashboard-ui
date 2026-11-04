import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export type StepperStep = { id: string; label: string };

type WizardStepperProps = {
  steps: StepperStep[];
  currentIndex: number;
  /** Steps before this index are shown as completed (create flow). Ignored when `freeNavigation`. */
  completedUntil?: number;
  freeNavigation?: boolean;
  /** Indexes that cannot be visited (e.g. the data steps once the car exists). */
  lockedUntil?: number;
  onStepClick?: (index: number) => void;
};

/** Horizontal stepper: pending `#a0a6ad`, active teal, completed green check (design handoff). */
const WizardStepper = ({
  steps,
  currentIndex,
  completedUntil = currentIndex,
  freeNavigation = false,
  lockedUntil = -1,
  onStepClick,
}: WizardStepperProps) => (
  <nav aria-label="Pasos del formulario">
    <ol className="flex items-center">
      {steps.map((step, index) => {
        const isActive = index === currentIndex;
        const isDone = !freeNavigation && index < completedUntil;
        const isLocked = index <= lockedUntil && !isActive;
        const clickable = !!onStepClick && !isActive && !isLocked && (freeNavigation || index < currentIndex);

        const circle = (
          <span
            className={cn(
              'flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors',
              isActive && 'border-primary-700 bg-primary-700 text-white',
              isDone && !isActive && 'border-success-500 bg-success-500 text-white',
              !isActive && !isDone && 'border-[#a0a6ad] bg-white text-[#a0a6ad]',
            )}
          >
            {isDone && !isActive ? <Check className="size-4" aria-hidden /> : index + 1}
          </span>
        );

        const content = (
          <>
            {circle}
            <span
              className={cn(
                'hidden text-sm font-medium whitespace-nowrap md:block',
                isActive ? 'text-primary-800' : isDone ? 'text-success-700' : 'text-[#a0a6ad]',
              )}
            >
              {step.label}
            </span>
          </>
        );

        return (
          <li key={step.id} className={cn('flex items-center', index < steps.length - 1 && 'flex-1')}>
            {clickable ? (
              <button
                type="button"
                onClick={() => onStepClick?.(index)}
                className="focus-visible:ring-primary-700 flex cursor-pointer items-center gap-2.5 rounded-md outline-none focus-visible:ring-2"
              >
                {content}
              </button>
            ) : (
              <div className="flex items-center gap-2.5" aria-current={isActive ? 'step' : undefined}>
                {content}
              </div>
            )}
            {index < steps.length - 1 && (
              <span
                aria-hidden
                className={cn('mx-3 h-0.5 flex-1 rounded', isDone ? 'bg-success-500' : 'bg-surface-600')}
              />
            )}
          </li>
        );
      })}
    </ol>
  </nav>
);

export default WizardStepper;
