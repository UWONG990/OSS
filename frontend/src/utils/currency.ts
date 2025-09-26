/**
 * Currency formatting utilities for Indonesian Rupiah
 */

export const formatCurrency = (amount: number): string => {
  // Format number with Indonesian locale for proper thousand separators
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatPrice = (price: string | number): string => {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  return formatCurrency(numericPrice);
};

export const parsePriceInput = (input: string): number => {
  // Remove any non-numeric characters except decimal point
  const cleaned = input.replace(/[^\d.]/g, '');
  return parseFloat(cleaned) || 0;
};

export const formatPriceInput = (value: string): string => {
  const numeric = parsePriceInput(value);
  if (isNaN(numeric) || numeric === 0) return '';
  
  // Format with thousand separators but no currency symbol for input fields
  return new Intl.NumberFormat('id-ID').format(numeric);
};