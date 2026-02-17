'use client';

import { useTheme } from '@/components/providers/ThemeProvider';
import { getChartTheme } from '@/components/charts/theme';

export function useChartTheme() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const ct = getChartTheme(isDark);
  return { isDark, tooltipStyle: ct.tooltip, axisStyle: ct.axis, gridStyle: ct.grid };
}
