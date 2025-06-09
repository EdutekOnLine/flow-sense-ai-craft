
// RTL utility functions for better right-to-left layout support

/**
 * Get the current text direction from the document
 */
export const getTextDirection = (): 'ltr' | 'rtl' => {
  return document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr';
};

/**
 * Check if the current layout direction is RTL
 */
export const isRTL = (): boolean => {
  return getTextDirection() === 'rtl';
};

/**
 * Get RTL-aware margin/padding classes
 */
export const getRTLAwareSpacing = (
  property: 'margin' | 'padding',
  direction: 'start' | 'end',
  size: string
): string => {
  const prefix = property === 'margin' ? 'm' : 'p';
  const dir = direction === 'start' ? 's' : 'e';
  return `${prefix}${dir}-${size}`;
};

/**
 * Get RTL-aware flex direction class
 */
export const getRTLAwareFlexDirection = (reverse = false): string => {
  const isRightToLeft = isRTL();
  
  if (reverse) {
    return isRightToLeft ? 'flex-row' : 'flex-row-reverse';
  }
  
  return isRightToLeft ? 'flex-row-reverse' : 'flex-row';
};

/**
 * Get RTL-aware text alignment
 */
export const getRTLAwareTextAlign = (align: 'start' | 'end' | 'center' = 'start'): string => {
  if (align === 'center') return 'text-center';
  
  const isRightToLeft = isRTL();
  
  if (align === 'start') {
    return isRightToLeft ? 'text-right' : 'text-left';
  }
  
  return isRightToLeft ? 'text-left' : 'text-right';
};

/**
 * Combine classes with RTL awareness
 */
export const combineRTLClasses = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

/**
 * Get icon position classes for RTL
 */
export const getRTLAwareIconPosition = (position: 'before' | 'after'): string => {
  const isRightToLeft = isRTL();
  
  if (position === 'before') {
    return isRightToLeft ? 'ml-2 order-2' : 'mr-2 order-1';
  }
  
  return isRightToLeft ? 'mr-2 order-1' : 'ml-2 order-2';
};

/**
 * Apply RTL-aware styling to components
 */
export const applyRTLStyling = (baseClasses: string, rtlClasses?: string): string => {
  if (!rtlClasses) return baseClasses;
  
  return isRTL() ? `${baseClasses} ${rtlClasses}` : baseClasses;
};
