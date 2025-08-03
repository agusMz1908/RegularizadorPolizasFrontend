// src/components/enhanced/ThemeToggle.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sun, Moon, Monitor, Palette, Check } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className }) => {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const themes = [
    {
      value: 'light',
      label: 'Claro',
      icon: Sun,
      description: 'Tema claro'
    },
    {
      value: 'dark', 
      label: 'Oscuro',
      icon: Moon,
      description: 'Tema oscuro'
    },
    {
      value: 'system',
      label: 'Sistema',
      icon: Monitor,
      description: 'Sigue la configuración del sistema'
    }
  ] as const;

  const currentTheme = themes.find(t => t.value === theme);
  const CurrentIcon = currentTheme?.icon || Palette;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "relative h-9 w-9 rounded-lg",
            "hover:bg-accent hover:text-accent-foreground",
            "focus:bg-accent focus:text-accent-foreground",
            "transition-all duration-200",
            className
          )}
        >
          {/* Icon with smooth transition */}
          <div className="relative h-4 w-4">
            <CurrentIcon className={cn(
              "absolute inset-0 h-4 w-4 transition-all duration-300",
              resolvedTheme === 'dark' 
                ? "rotate-0 scale-100" 
                : "rotate-90 scale-0"
            )} />
            <Sun className={cn(
              "absolute inset-0 h-4 w-4 transition-all duration-300",
              resolvedTheme === 'light' 
                ? "rotate-0 scale-100" 
                : "rotate-90 scale-0"
            )} />
          </div>
          <span className="sr-only">Cambiar tema</span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="min-w-[160px] bg-background/95 backdrop-blur-sm border shadow-lg"
      >
        <div className="px-2 py-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Apariencia
          </p>
        </div>
        
        {themes.map((themeOption) => {
          const Icon = themeOption.icon;
          const isSelected = theme === themeOption.value;
          
          return (
            <DropdownMenuItem
              key={themeOption.value}
              onClick={() => setTheme(themeOption.value)}
              className={cn(
                "flex items-center gap-3 px-2 py-2 text-sm",
                "cursor-pointer rounded-md transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                isSelected && "bg-accent/50 text-accent-foreground"
              )}
            >
              <div className="flex items-center gap-3 flex-1">
                <Icon className="h-4 w-4 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium">{themeOption.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {themeOption.description}
                  </div>
                </div>
              </div>
              
              {isSelected && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          );
        })}
        
        {/* Preview indicator */}
        <div className="px-2 py-2 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className={cn(
              "w-2 h-2 rounded-full",
              resolvedTheme === 'dark' 
                ? "bg-slate-800" 
                : "bg-white border border-gray-300"
            )} />
            <span>Actualmente: {resolvedTheme === 'dark' ? 'Oscuro' : 'Claro'}</span>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};