import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SegmentedControlProps<T extends string | boolean | undefined> {
  options: ReadonlyArray<{ readonly label: string; readonly value: T }>;
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string | boolean | undefined>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-lg bg-surface-container-high p-0.5">
      {options.map((option) => (
        <Button
          key={String(option.value)}
          size="xs"
          variant="ghost"
          className={cn(
            'rounded-md border-0 px-2.5 text-xs font-medium transition-colors duration-150',
            option.value === value
              ? 'bg-surface text-on-surface shadow-sm hover:bg-surface'
              : 'bg-transparent text-on-surface-variant hover:bg-transparent hover:text-on-surface',
          )}
          onClick={() => {
            onChange(option.value);
          }}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
