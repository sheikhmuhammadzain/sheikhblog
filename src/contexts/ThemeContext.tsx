import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'dark';

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  forcedTheme?: Theme;
}

interface ThemeProviderState {
  theme: Theme;
}

const initialState: ThemeProviderState = {
  theme: 'dark',
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'dark',
  forcedTheme,
}: ThemeProviderProps) {
  const [theme] = useState<Theme>(defaultTheme);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const value = {
    theme: forcedTheme || theme,
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};
