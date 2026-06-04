// Small label chip for stats, ranks, and territory status
interface BadgeProps {
  label: string;
  variant?: 'accent' | 'danger' | 'neutral';
}

export function Badge({ label, variant = 'neutral' }: BadgeProps) {
  const variants = {
    accent: 'bg-accent/15 text-accent border-accent/25',
    danger: 'bg-danger/15 text-danger border-danger/25',
    neutral: 'bg-white/5 text-textSecondary border-white/10',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-body border ${variants[variant]}`}
    >
      {label}
    </span>
  );
}
