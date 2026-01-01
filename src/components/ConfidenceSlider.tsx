import { cn } from '@/lib/utils';

interface ConfidenceSliderProps {
  value: 'low' | 'medium' | 'high' | null;
  onChange: (value: 'low' | 'medium' | 'high') => void;
  disabled?: boolean;
}

const options = [
  { value: 'low' as const, label: 'Guessing', emoji: '🤔' },
  { value: 'medium' as const, label: 'Somewhat sure', emoji: '😐' },
  { value: 'high' as const, label: 'Confident', emoji: '😎' },
];

export function ConfidenceSlider({ value, onChange, disabled }: ConfidenceSliderProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground text-center">How confident are you?</p>
      <div className="flex gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            disabled={disabled}
            className={cn(
              'flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all',
              value === option.value
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-muted text-muted-foreground hover:bg-muted/80',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <span className="block text-base mb-0.5">{option.emoji}</span>
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}