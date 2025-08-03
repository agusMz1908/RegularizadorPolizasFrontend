/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ==================== ENHANCED COLOR SYSTEM ====================
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: 'calc(var(--radius) + 4px)',
        '2xl': 'calc(var(--radius) + 8px)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        // ✅ Enhanced Status Colors
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))'
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))'
        },
        info: {
          DEFAULT: 'hsl(var(--info))',
          foreground: 'hsl(var(--info-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        }
      },
      
      // ==================== ENHANCED ANIMATIONS ====================
      animation: {
        // Existing
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        
        // ✨ New Enhanced Animations
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'fade-in-down': 'fadeInDown 0.5s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-left': 'slideLeft 0.3s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'scale-out': 'scaleOut 0.2s ease-in',
        'pulse-slow': 'pulse 3s infinite',
        'bounce-subtle': 'bounceSubtle 1s ease-in-out infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
        'spin-slow': 'spin 3s linear infinite',
        'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      
      // ==================== KEYFRAMES ====================
      keyframes: {
        // Existing
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        
        // ✨ New Keyframes
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(20px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        fadeInDown: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(-20px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { 
            opacity: '0',
            transform: 'scale(0.9)'
          },
          '100%': { 
            opacity: '1',
            transform: 'scale(1)'
          },
        },
        scaleOut: {
          '0%': { 
            opacity: '1',
            transform: 'scale(1)'
          },
          '100%': { 
            opacity: '0',
            transform: 'scale(0.9)'
          },
        },
        bounceSubtle: {
          '0%, 100%': { 
            transform: 'translateY(0)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)'
          },
          '50%': { 
            transform: 'translateY(-5px)',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)'
          },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-3deg)' },
          '75%': { transform: 'rotate(3deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px hsl(var(--primary))' },
          '100%': { boxShadow: '0 0 20px hsl(var(--primary))' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      
      // ==================== ENHANCED SPACING ====================
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },
      
      // ==================== ENHANCED TYPOGRAPHY ====================
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '3.5rem' }],
      },
      
      // ==================== ENHANCED SHADOWS ====================
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.05)',
        'medium': '0 4px 16px rgba(0, 0, 0, 0.1)',
        'strong': '0 8px 32px rgba(0, 0, 0, 0.15)',
        'inner-soft': 'inset 0 1px 3px rgba(0, 0, 0, 0.1)',
        'glow-primary': '0 0 20px hsl(var(--primary) / 0.3)',
        'glow-secondary': '0 0 20px hsl(var(--secondary) / 0.3)',
      },
      
      // ==================== ENHANCED EFFECTS ====================
      backdropBlur: {
        xs: '2px',
      },
      
      // ==================== ENHANCED TRANSITIONS ====================
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
        '1200': '1200ms',
      },
      
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'elastic': 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
      },
      
      // ==================== ENHANCED GRADIENTS ====================
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'shimmer': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
        'mesh-primary': 'radial-gradient(at 40% 20%, hsl(var(--primary)) 0px, transparent 50%), radial-gradient(at 80% 0%, hsl(var(--secondary)) 0px, transparent 50%), radial-gradient(at 0% 50%, hsl(var(--accent)) 0px, transparent 50%)',
      },
      
      // ==================== ENHANCED SCREENS ====================
      screens: {
        'xs': '475px',
        '3xl': '1680px',
        '4xl': '2048px',
      },
      
      // ==================== ENHANCED OPACITY ====================
      opacity: {
        '15': '0.15',
        '35': '0.35',
        '65': '0.65',
        '85': '0.85',
      },
      
      // ==================== ENHANCED Z-INDEX ====================
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    }
  },
  plugins: [
    require("tailwindcss-animate"),
    // Plugin personalizado para utilidades adicionales
    function({ addUtilities, addComponents, theme }) {
      // ==================== CUSTOM UTILITIES ====================
      addUtilities({
        // 🎨 Gradient Text Utilities
        '.text-gradient-primary': {
          background: 'var(--primary-gradient)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.text-gradient-secondary': {
          background: 'var(--secondary-gradient)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.text-gradient-accent': {
          background: 'var(--accent-gradient)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        
        // ✨ Transform Utilities
        '.transform-gpu': {
          transform: 'translate3d(0, 0, 0)',
        },
        
        // 📱 Safe Area Utilities
        '.pt-safe': {
          'padding-top': 'env(safe-area-inset-top)',
        },
        '.pb-safe': {
          'padding-bottom': 'env(safe-area-inset-bottom)',
        },
        '.pl-safe': {
          'padding-left': 'env(safe-area-inset-left)',
        },
        '.pr-safe': {
          'padding-right': 'env(safe-area-inset-right)',
        },
        
        // 🎭 Backdrop Utilities
        '.backdrop-blur-light': {
          'backdrop-filter': 'blur(8px)',
          '-webkit-backdrop-filter': 'blur(8px)',
        },
        
        // 📏 Container Utilities
        '.container-responsive': {
          width: '100%',
          'margin-left': 'auto',
          'margin-right': 'auto',
          'padding-left': '1rem',
          'padding-right': '1rem',
          '@screen sm': {
            'padding-left': '1.5rem',
            'padding-right': '1.5rem',
          },
          '@screen lg': {
            'padding-left': '2rem',
            'padding-right': '2rem',
          },
        },
        
        // 🎯 Interactive Utilities
        '.interactive': {
          cursor: 'pointer',
          'user-select': 'none',
          '-webkit-tap-highlight-color': 'transparent',
        },
        
        // 📜 Scrollbar Utilities
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
          '&::-webkit-scrollbar': {
            width: '6px',
            height: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'hsl(var(--muted))',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'hsl(var(--muted-foreground) / 0.3)',
            'border-radius': '3px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'hsl(var(--muted-foreground) / 0.5)',
          },
        },
        
        '.scrollbar-hidden': {
          'scrollbar-width': 'none',
          '-ms-overflow-style': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      });

      // ==================== CUSTOM COMPONENTS ====================
      addComponents({
        // 🎨 Enhanced Button Components
        '.btn-gradient-primary': {
          background: 'var(--primary-gradient)',
          color: 'white',
          border: 'none',
          'box-shadow': '0 4px 16px hsl(var(--primary) / 0.3)',
          transition: 'all 300ms ease',
          '&:hover': {
            transform: 'translateY(-1px)',
            'box-shadow': '0 8px 24px hsl(var(--primary) / 0.4)',
            filter: 'brightness(1.1)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        
        '.btn-gradient-secondary': {
          background: 'var(--secondary-gradient)',
          color: 'white',
          border: 'none',
          'box-shadow': '0 4px 16px hsl(var(--secondary) / 0.3)',
          transition: 'all 300ms ease',
          '&:hover': {
            transform: 'translateY(-1px)',
            'box-shadow': '0 8px 24px hsl(var(--secondary) / 0.4)',
            filter: 'brightness(1.1)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        
        // 🏷️ Enhanced Card Components
        '.card-enhanced': {
          background: 'hsl(var(--card))',
          color: 'hsl(var(--card-foreground))',
          'border-radius': 'var(--radius)',
          border: '1px solid hsl(var(--border))',
          'box-shadow': '0 2px 8px hsl(var(--shadow-color) / 0.1)',
          transition: 'all 300ms ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            'box-shadow': '0 8px 24px hsl(var(--shadow-color) / 0.15)',
            'border-color': 'hsl(var(--primary) / 0.2)',
          },
        },
        
        '.card-interactive': {
          background: 'hsl(var(--card))',
          color: 'hsl(var(--card-foreground))',
          'border-radius': 'var(--radius)',
          border: '1px solid hsl(var(--border))',
          'box-shadow': '0 2px 8px hsl(var(--shadow-color) / 0.1)',
          cursor: 'pointer',
          transition: 'all 300ms ease',
          'user-select': 'none',
          '&:hover': {
            transform: 'translateY(-4px) scale(1.02)',
            'box-shadow': '0 12px 32px hsl(var(--shadow-color) / 0.2)',
            'border-color': 'hsl(var(--primary) / 0.3)',
          },
          '&:active': {
            transform: 'translateY(-2px) scale(1.01)',
          },
        },
        
        // 📝 Enhanced Input Components
        '.input-enhanced': {
          background: 'hsl(var(--background))',
          border: '1px solid hsl(var(--border))',
          'border-radius': 'calc(var(--radius) - 2px)',
          padding: '0.5rem 0.75rem',
          'font-size': '0.875rem',
          transition: 'all 300ms ease',
          '&:focus': {
            outline: 'none',
            'border-color': 'hsl(var(--primary))',
            'box-shadow': '0 0 0 2px hsl(var(--primary) / 0.1)',
            'ring-width': '2px',
            'ring-color': 'hsl(var(--primary) / 0.5)',
          },
          '&::placeholder': {
            color: 'hsl(var(--muted-foreground))',
          },
        },
        
        // 🌈 Gradient Background Components
        '.gradient-primary': {
          background: 'var(--primary-gradient)',
        },
        
        '.gradient-secondary': {
          background: 'var(--secondary-gradient)',
        },
        
        '.gradient-accent': {
          background: 'var(--accent-gradient)',
        },
        
        '.gradient-bg': {
          background: 'var(--gradient-bg)',
        },
        
        // ✨ Animation Helper Components
        '.hover-lift': {
          transition: 'transform 300ms ease, box-shadow 300ms ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            'box-shadow': '0 8px 24px hsl(var(--shadow-color) / 0.12)',
          },
        },
        
        '.hover-scale': {
          transition: 'transform 300ms ease',
          '&:hover': {
            transform: 'scale(1.05)',
          },
        },
        
        '.hover-glow': {
          transition: 'box-shadow 300ms ease',
          '&:hover': {
            'box-shadow': '0 0 20px hsl(var(--primary) / 0.3)',
          },
        },
        
        // 🎯 Loading Components
        '.loading-spinner': {
          display: 'inline-block',
          width: '1rem',
          height: '1rem',
          border: '2px solid hsl(var(--muted))',
          'border-top': '2px solid hsl(var(--primary))',
          'border-radius': '50%',
          animation: 'spin 1s linear infinite',
        },
        
        '.loading-dots': {
          display: 'inline-flex',
          'align-items': 'center',
          'gap': '0.25rem',
          '& > span': {
            width: '0.5rem',
            height: '0.5rem',
            'border-radius': '50%',
            background: 'hsl(var(--primary))',
            animation: 'bounce 1.4s ease-in-out infinite both',
          },
          '& > span:nth-child(1)': {
            'animation-delay': '-0.32s',
          },
          '& > span:nth-child(2)': {
            'animation-delay': '-0.16s',
          },
        },
      });
    }
  ],
}