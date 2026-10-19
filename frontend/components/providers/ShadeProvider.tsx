'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type ShadeContextType = {
  enabled: boolean;
  toggle: () => void;
};

const ShadeContext = createContext<ShadeContextType>({ enabled: true, toggle: () => {} });

export function useShade() {
  return useContext(ShadeContext);
}

export function ShadeProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('lts-president-shade');
    if (stored === 'off') setEnabled(false);
  }, []);

  const toggle = () => {
    setEnabled((current) => {
      const next = !current;
      localStorage.setItem('lts-president-shade', next ? 'on' : 'off');
      return next;
    });
  };

  return <ShadeContext.Provider value={{ enabled, toggle }}>{children}</ShadeContext.Provider>;
}
