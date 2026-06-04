// Circular avatar with user image or initials fallback
interface AvatarProps {
  src?: string | null;
  username: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export function Avatar({ src, username, size = 'md', color = '#C8FF00' }: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-xl',
  };
  const initials = username.slice(0, 2).toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt={username}
        className={`${sizes[size]} rounded-full object-cover flex-shrink-0`}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-heading font-bold flex-shrink-0`}
      style={{ backgroundColor: color }}
    >
      <span className="text-background">{initials}</span>
    </div>
  );
}
