/**
 * Utility functions for formatting numbers, dates, and other data types
 */

/**
 * Format large numbers with appropriate suffixes (K, M, B, T)
 */
export function formatNumber(value: number): string {
  if (Math.abs(value) >= 1e12) {
    return `${(value / 1e12).toFixed(1)}T`;
  }
  if (Math.abs(value) >= 1e9) {
    return `${(value / 1e9).toFixed(1)}B`;
  }
  if (Math.abs(value) >= 1e6) {
    return `${(value / 1e6).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1e3) {
    return `${(value / 1e3).toFixed(1)}K`;
  }
  return value.toFixed(0);
}

/**
 * Format currency values with dollar sign and appropriate suffixes
 */
export function formatCurrency(value: number): string {
  const formatted = formatNumber(value);
  return `$${formatted}`;
}

/**
 * Format percentages with % sign
 */
export function formatPercent(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format dates in a consistent way
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format date for charts (shorter format)
 */
export function formatChartDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: '2-digit',
    month: 'short',
  });
}

/**
 * Format large currency values for display in tables/cards
 */
export function formatLargeCurrency(value: number): string {
  if (Math.abs(value) >= 1e12) {
    return `$${(value / 1e12).toFixed(2)} trillion`;
  }
  if (Math.abs(value) >= 1e9) {
    return `$${(value / 1e9).toFixed(2)} billion`;
  }
  if (Math.abs(value) >= 1e6) {
    return `$${(value / 1e6).toFixed(2)} million`;
  }
  if (Math.abs(value) >= 1e3) {
    return `$${(value / 1e3).toFixed(2)} thousand`;
  }
  return `$${value.toFixed(2)}`;
}

/**
 * Format percentage change with appropriate coloring context
 */
export function formatPercentChange(value: number, invertColors = false): {
  formatted: string;
  isPositive: boolean;
  colorClass: string;
} {
  const formatted = formatPercent(value);
  const isPositive = value > 0;
  const isGood = invertColors ? !isPositive : isPositive;
  
  return {
    formatted: `${isPositive ? '+' : ''}${formatted}`,
    isPositive,
    colorClass: isGood ? 'text-green-500' : 'text-red-500',
  };
}