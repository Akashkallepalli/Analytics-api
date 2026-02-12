// Centralized error handling

class ApiError extends Error {
  constructor(message, statusCode, details = {}) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

function errorHandler(err, req, res, next) {
  console.error('Error:', err);
  
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        statusCode: err.statusCode,
        details: err.details
      }
    });
  }
  
  if (err.message && err.message.includes('Invalid')) {
    return res.status(400).json({
      success: false,
      error: {
        message: err.message,
        statusCode: 400
      }
    });
  }
  
  return res.status(500).json({
    success: false,
    error: {
      message: 'Internal Server Error',
      statusCode: 500
    }
  });
}

module.exports = {
  ApiError,
  errorHandler
};
