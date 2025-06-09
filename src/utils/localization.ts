
import { format as formatDate, formatDistanceToNow as formatDistance } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { ar } from 'date-fns/locale/ar';

// Get the appropriate date-fns locale based on the current language
export const getDateFnsLocale = (language: string) => {
  switch (language) {
    case 'ar':
      return ar;
    default:
      return enUS;
  }
};

// Format dates with proper localization
export const formatLocalizedDate = (date: Date | string, formatString: string, language: string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const locale = getDateFnsLocale(language);
  return formatDate(dateObj, formatString, { locale });
};

// Format relative time with proper localization
export const formatLocalizedDistanceToNow = (date: Date | string, language: string, options?: { addSuffix?: boolean }) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const locale = getDateFnsLocale(language);
  return formatDistance(dateObj, { locale, addSuffix: options?.addSuffix ?? true });
};

// Format numbers with proper localization
export const formatLocalizedNumber = (number: number, language: string, options?: Intl.NumberFormatOptions) => {
  const locale = language === 'ar' ? 'ar-EG' : 'en-US';
  return new Intl.NumberFormat(locale, options).format(number);
};

// Format currency with proper localization
export const formatLocalizedCurrency = (amount: number, language: string, currency: string = 'USD') => {
  const locale = language === 'ar' ? 'ar-EG' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
};
