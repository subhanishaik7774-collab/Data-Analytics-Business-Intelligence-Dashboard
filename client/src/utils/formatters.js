// Format numbers as Currency (USD)
export const formatCurrency = (value) => {
  const num = parseFloat(value);
  if (isNaN(num)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

// Format percentages
export const formatPercent = (value) => {
  const num = parseFloat(value);
  if (isNaN(num)) return '0.00%';
  return `${num.toFixed(2)}%`;
};

// Format large integers with commas
export const formatInteger = (value) => {
  const num = parseInt(value);
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat('en-US').format(num);
};

// Shorthand formatter for clean chart labels (e.g., 142000 -> $142k)
export const formatCompact = (value, unit = '$') => {
  const num = parseFloat(value);
  if (isNaN(num)) return '0';

  let formatted = '';
  if (Math.abs(num) >= 1.0e6) {
    formatted = `${(num / 1.0e6).toFixed(1)}M`;
  } else if (Math.abs(num) >= 1.0e3) {
    formatted = `${(num / 1.0e3).toFixed(1)}K`;
  } else {
    formatted = num.toFixed(0);
  }

  return unit === '$' ? `$${formatted}` : `${formatted}${unit === '%' ? '%' : ''}`;
};

// Localize date strings nicely
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC' // Keep date exact without timezone shifting issues
  }).format(date);
};
