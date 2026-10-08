/**
 * Standardized European Currency (EUR) and Number Formatting for EcoFreight
 * Consistent format: '€' symbol, comma thousands separator, dot decimal separator.
 */

export const formatEUR = (amount: number, decimals: number = 2): string => {
  if (isNaN(amount)) return '€0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
};

export const formatNumber = (num: number, decimals: number = 0): string => {
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

export const formatWeight = (tonnes: number): string => {
  return `${formatNumber(tonnes, 1)} t`;
};

export const formatEmissions = (kg: number): string => {
  if (kg >= 1000) {
    return `${formatNumber(kg / 1000, 2)} t CO2e`;
  }
  return `${formatNumber(kg, 0)} kg CO2e`;
};
