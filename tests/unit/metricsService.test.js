
const metricsService = require('../../src/services/metricsService');

describe('Metrics Service - Unit Tests', () => {
  
  describe('getDailyMetrics', () => {
    
    test('should return all metrics when no date range provided', () => {
      const result = metricsService.getDailyMetrics();
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
    });
    
    test('should filter metrics by start_date', () => {
      const startDate = '2023-06-01';
      const result = metricsService.getDailyMetrics(startDate);
      
      expect(result).toBeInstanceOf(Array);
      result.forEach(metric => {
        expect(metric.date).toGreaterThanOrEqual(startDate);
      });
    });
    
    test('should filter metrics by end_date', () => {
      const endDate = '2023-06-30';
      const result = metricsService.getDailyMetrics(null, endDate);
      
      expect(result).toBeInstanceOf(Array);
      result.forEach(metric => {
        expect(metric.date).toBeLessThanOrEqual(endDate);
      });
    });
    
    test('should filter metrics by date range', () => {
      const startDate = '2023-06-01';
      const endDate = '2023-06-30';
      const result = metricsService.getDailyMetrics(startDate, endDate);
      
      expect(result).toBeInstanceOf(Array);
      result.forEach(metric => {
        expect(metric.date).toGreaterThanOrEqual(startDate);
        expect(metric.date).toBeLessThanOrEqual(endDate);
      });
    });
    
    test('should return metrics with correct structure', () => {
      const result = metricsService.getDailyMetrics('2023-01-01', '2023-01-31');
      
      expect(result.length).toBeGreaterThan(0);
      const metric = result[0];
      
      expect(metric).toHaveProperty('date');
      expect(metric).toHaveProperty('users_active');
      expect(metric).toHaveProperty('page_views');
      expect(metric).toHaveProperty('revenue');
    });
    
    test('should return empty array for future date range', () => {
      const startDate = '2099-01-01';
      const endDate = '2099-12-31';
      const result = metricsService.getDailyMetrics(startDate, endDate);
      
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(0);
    });
  });
  
  describe('getHourlyMetrics', () => {
    
    test('should return all hourly metrics when no date range provided', () => {
      const result = metricsService.getHourlyMetrics();
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
    });
    
    test('should filter hourly metrics by start_date', () => {
      const startDate = '2024-06-01';
      const result = metricsService.getHourlyMetrics(startDate);
      
      result.forEach(metric => {
        expect(metric.timestamp.startsWith(startDate)).toBe(true);
      });
    });
    
    test('should return hourly metrics with correct structure', () => {
      const result = metricsService.getHourlyMetrics('2024-01-01', '2024-01-02');
      
      expect(result.length).toBeGreaterThan(0);
      const metric = result[0];
      
      expect(metric).toHaveProperty('timestamp');
      expect(metric).toHaveProperty('users_active');
      expect(metric).toHaveProperty('page_views');
      expect(metric).toHaveProperty('revenue');
    });
  });
});
