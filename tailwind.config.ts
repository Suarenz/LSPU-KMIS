import type { Config } from 'tailwindcss';

export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'oklch(var(--color-background))',
        foreground: 'oklch(var(--color-foreground))',
        card: 'oklch(var(--color-card))',
        'card-foreground': 'oklch(var(--color-card-foreground))',
        popover: 'oklch(var(--color-popover))',
        'popover-foreground': 'oklch(var(--color-popover-foreground))',
        primary: 'oklch(var(--color-primary))',
        'primary-foreground': 'oklch(var(--color-primary-foreground))',
        secondary: 'oklch(var(--color-secondary))',
        'secondary-foreground': 'oklch(var(--color-secondary-foreground))',
        muted: 'oklch(var(--color-muted))',
        'muted-foreground': 'oklch(var(--color-muted-foreground))',
        accent: 'oklch(var(--color-accent))',
        'accent-foreground': 'oklch(var(--color-accent-foreground))',
        destructive: 'oklch(var(--color-destructive))',
        'destructive-foreground': 'oklch(var(--color-destructive-foreground))',
        border: 'oklch(var(--color-border))',
        input: 'oklch(var(--color-input))',
        ring: 'oklch(var(--color-ring))',
        sidebar: {
          DEFAULT: 'oklch(var(--color-sidebar))',
          foreground: 'oklch(var(--color-sidebar-foreground))',
          primary: 'oklch(var(--color-sidebar-primary))',
          'primary-foreground': 'oklch(var(--color-sidebar-primary-foreground))',
          accent: 'oklch(var(--color-sidebar-accent))',
          'accent-foreground': 'oklch(var(--color-sidebar-accent-foreground))',
          border: 'oklch(var(--color-sidebar-border))',
          ring: 'oklch(var(--color-sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
} satisfies Config;