
const express = require('express');
const metricsService = require('../services/metricsService');
const { sanitizeQueryParams } = require('../utils/validators');
const { ApiError } = require('../utils/errorHandler');

const router = express.Router();

// ============================================================================
// GET /api/v1/metrics/daily
// ============================================================================
router.get('/daily', async (req, res, next) => {
  try {
    // Validate and sanitize query parameters
    const params = sanitizeQueryParams(req.query);
    
    // Set cache key
    const cacheKey = `metrics:daily:${JSON.stringify(params)}`;
    req.cacheKey = cacheKey;
    
    // Simulate computation time for cache demonstration
    console.log(`Fetching daily metrics: ${JSON.stringify(params)}`);
    
    const data = metricsService.getDailyMetrics(
      params.start_date,
      params.end_date
    );
    
    res.status(200).json({
      success: true,
      data: data,
      count: data.length,
      timestamp: new Date().toISOString(),
      cached: req.cached || false
    });
  } catch (err) {
    next(err);
  }
});

// ============================================================================
// GET /api/v1/metrics/hourly
// ============================================================================
router.get('/hourly', async (req, res, next) => {
  try {
    // Validate and sanitize query parameters
    const params = sanitizeQueryParams(req.query);
    
    // Set cache key
    const cacheKey = `metrics:hourly:${JSON.stringify(params)}`;
    req.cacheKey = cacheKey;
    
    console.log(`Fetching hourly metrics: ${JSON.stringify(params)}`);
    
    const data = metricsService.getHourlyMetrics(
      params.start_date,
      params.end_date
    );
    
    res.status(200).json({
      success: true,
      data: data,
      count: data.length,
      timestamp: new Date().toISOString(),
      cached: req.cached || false
    });
  } catch (err) {
    next(err);
  }
});

// ============================================================================
// GET /api/v1/metrics/summary
// ============================================================================
router.get('/summary', async (req, res, next) => {
  try {
    const params = sanitizeQueryParams(req.query);
    const cacheKey = `metrics:summary:${JSON.stringify(params)}`;
    req.cacheKey = cacheKey;
    
    const dailyData = metricsService.getDailyMetrics(
      params.start_date,
      params.end_date
    );
    
    const summary = {
      total_active_users: dailyData.reduce((sum, d) => sum + d.users_active, 0),
      total_page_views: dailyData.reduce((sum, d) => sum + d.page_views, 0),
      total_revenue: dailyData.reduce((sum, d) => sum + d.revenue, 0),
      average_daily_users: Math.round(dailyData.reduce((sum, d) => sum + d.users_active, 0) / dailyData.length),
      average_daily_page_views: Math.round(dailyData.reduce((sum, d) => sum + d.page_views, 0) / dailyData.length),
      date_range: {
        start: params.start_date || dailyData[0]?.date,
        end: params.end_date || dailyData[dailyData.length - 1]?.date
      }
    };
    
    res.status(200).json({
      success: true,
      data: summary,
      timestamp: new Date().toISOString(),
      cached: req.cached || false
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;