import leveaLogo from '@/assets/levea-logo.png';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  textClassName?: string;
}

const sizeClasses = {
  xs: 'h-6',
  sm: 'h-8',
  md: 'h-10',
  lg: 'h-14',
  xl: 'h-20',
};

export function Logo({ size = 'md', showText = false, className, textClassName }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <img 
        src={leveaLogo} 
        alt="LEVEA" 
        className={cn(sizeClasses[size], "w-auto object-contain")}
      />
      {showText && (
        <span className={cn(
          "font-display font-bold text-foreground",
          size === 'xs' && "text-lg",
          size === 'sm' && "text-xl",
          size === 'md' && "text-2xl",
          size === 'lg' && "text-3xl",
          size === 'xl' && "text-4xl",
          textClassName
        )}>
          LEVEA
        </span>
      )}
    </div>
  );
}

export function LogoIcon({ size = 'md', className }: { size?: LogoProps['size']; className?: string }) {
  return (
    <img 
      src={leveaLogo} 
      alt="LEVEA" 
      className={cn(sizeClasses[size], "w-auto object-contain", className)}
    />
  );
}
