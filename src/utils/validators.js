// Input validation utilities

function validateDateFormat(dateString) {
  if (!dateString) return true; // Optional parameter
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

function validateDateRange(startDate, endDate) {
  if (!startDate || !endDate) return true;
  
  if (!validateDateFormat(startDate) || !validateDateFormat(endDate)) {
    return false;
  }
  
  return new Date(startDate) <= new Date(endDate);
}

function sanitizeQueryParams(params) {
  const sanitized = {};
  
  if (params.start_date) {
    if (!validateDateFormat(params.start_date)) {
      throw new Error('Invalid start_date format. Use YYYY-MM-DD');
    }
    sanitized.start_date = params.start_date;
  }
  
  if (params.end_date) {
    if (!validateDateFormat(params.end_date)) {
      throw new Error('Invalid end_date format. Use YYYY-MM-DD');
    }
    sanitized.end_date = params.end_date;
  }
  
  if (sanitized.start_date && sanitized.end_date) {
    if (!validateDateRange(sanitized.start_date, sanitized.end_date)) {
      throw new Error('start_date must not be after end_date');
    }
  }
  
  return sanitized;
}

module.exports = {
  validateDateFormat,
  validateDateRange,
  sanitizeQueryParams
};
