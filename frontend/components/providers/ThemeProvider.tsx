'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'editorial' | 'editorial-dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({ theme: 'editorial', toggleTheme: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('editorial');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('lts-theme') as Theme | null;
    if (stored && ['editorial', 'editorial-dark'].includes(stored)) {
      setTheme(stored);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('editorial-dark');
    } else {
      setTheme('editorial');
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('lts-theme', theme);
  }, [theme, mounted]);

  const toggleTheme = () => setTheme(prev => prev === 'editorial' ? 'editorial-dark' : 'editorial');

  // Prevent flash — render children with editorial default until mounted
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}