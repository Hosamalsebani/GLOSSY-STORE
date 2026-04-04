/**
 * Centralized utility for formatting currency across the GLOSSY platform.
 * Supports both English (LYD) and Arabic (د.ل) units.
 */
export const formatCurrency = (amount: number, locale: string = 'ar'): string => {
  const formattedAmount = Number(amount).toFixed(2);
  const isRtl = locale === 'ar';
  
  // Libyan Dinar: د.ل in Arabic, LYD in English
  const unit = isRtl ? 'د.ل' : 'LYD';
  
  return isRtl 
    ? `${formattedAmount} ${unit}`
    : `${formattedAmount} ${unit}`;
};

/**
 * Returns only the currency unit for use in components that handle the number separately.
 */
export const getCurrencyUnit = (locale: string = 'ar'): string => {
  return locale === 'ar' ? 'د.ل' : 'LYD';
};
