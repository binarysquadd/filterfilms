import { cn } from '@/app/lib/utils';
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  light?: boolean;
  className?: string;
}

export default function SectionHeader({
  title,
  subtitle,
  centered = false,
  light = false,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn(centered && 'text-center', className)}>
      {/* Decorative element */}
      <div className={cn('flex items-center gap-4 mb-4', centered && 'justify-center')}>
        <div className={cn('w-12 h-px', light ? 'bg-gold-light' : 'bg-gold')} />
        <span
          className={cn(
            'text-sm tracking-[0.3em] uppercase',
            light ? 'text-gold-light' : 'text-gold'
          )}
        >
          ✦
        </span>
        <div className={cn('w-12 h-px', light ? 'bg-gold-light' : 'bg-gold')} />
      </div>

      <h2
        className={cn(
          'font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-4',
          light ? 'text-primary-foreground' : 'text-foreground'
        )}
      >
        {title}
      </h2>

      {subtitle && (
        <p
          className={cn(
            'text-lg max-w-2xl font-semibold leading-relaxed',
            centered && 'mx-auto',
            light ? 'text-primary-foreground/80' : 'text-muted-foreground'
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
