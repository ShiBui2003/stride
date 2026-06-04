// Territory colour selector — a grid of preset colours with a ring on the active one
interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

const COLORS = [
  '#C8FF00', // Electric lime (default)
  '#00CFFF', // Cyan
  '#FF6B35', // Orange
  '#FF3BFF', // Magenta
  '#00FF9F', // Mint
  '#FFD93D', // Yellow
  '#A78BFA', // Purple
  '#FF3B30', // Red
] as const;

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {COLORS.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          aria-label={`Select colour ${color}`}
          aria-pressed={value === color}
          className={`h-12 rounded-xl transition-all ${
            value === color
              ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-background'
              : 'opacity-70 hover:opacity-100'
          }`}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}
