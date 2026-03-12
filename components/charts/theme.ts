// Chart theme — uses CSS variable-aware colors
// Note: Recharts uses inline styles so we provide both dark/light helpers

export function getChartTheme(isDark: boolean) {
  return {
    tooltip: {
      backgroundColor: isDark ? '#171717' : '#ffffff',
      border: `1px solid ${isDark ? '#333' : '#e5e5e5'}`,
      borderRadius: '6px',
      color: isDark ? '#fff' : '#111',
    },
    axis: {
      stroke: isDark ? '#525252' : '#999999',
      fontSize: 12,
    },
    grid: {
      strokeDasharray: '3 3',
      stroke: isDark ? '#222' : '#e5e5e5',
    },
  };
}

// Default dark theme (backward compat)
export const chartTooltipStyle = {
  backgroundColor: '#171717',
  border: '1px solid #333',
  borderRadius: '6px',
  color: '#fff',
};

export const chartAxisStyle = {
  stroke: '#525252',
  fontSize: 12,
};

export const chartGridStyle = {
  strokeDasharray: '3 3',
  stroke: '#222',
};

// Muted chart colors that work on both dark and light
export const CHART_COLORS = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899'];
export const PIE_COLORS = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899'];
