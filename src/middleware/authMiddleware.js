
const { ApiError } = require('../utils/errorHandler');

function authMiddleware(req, res, next) {
  try {
    const apiKey = req.headers['x-api-key'];
    const expectedApiKey = process.env.API_KEY || 'your_super_secret_api_key_123';
    
    if (!apiKey) {
      throw new ApiError(
        'API Key not provided',
        401,
        { header: 'X-API-Key required' }
      );
    }
    
    if (apiKey !== expectedApiKey) {
      throw new ApiError(
        'Invalid API Key',
        401,
        { header: 'X-API-Key invalid' }
      );
    }
    
    // Attach client info to request
    req.clientId = apiKey;
    next();
  } catch (err) {
    res.status(err.statusCode || 401).json({
      success: false,
      error: {
        message: err.message,
        statusCode: err.statusCode || 401
      }
    });
  }
}

module.exports = authMiddleware;