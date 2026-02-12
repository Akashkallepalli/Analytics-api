
const fs = require('fs');
const path = require('path');

// ============================================================================
// GENERATE MOCK DATA
// ============================================================================
function generateMockDailyMetrics() {
  const metrics = [];
  const startDate = new Date('2023-01-01');
  const endDate = new Date('2024-12-31');
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    metrics.push({
      date: d.toISOString().split('T')[0],
      users_active: Math.floor(Math.random() * 5000) + 1000,
      page_views: Math.floor(Math.random() * 50000) + 10000,
      revenue: parseFloat((Math.random() * 10000 + 1000).toFixed(2)),
      bounce_rate: parseFloat((Math.random() * 60 + 20).toFixed(2)),
      avg_session_duration: Math.floor(Math.random() * 30 + 2)
    });
  }
  
  return metrics;
}

function generateMockHourlyMetrics() {
  const metrics = [];
  const startDate = new Date('2024-01-01');
  const endDate = new Date('2024-12-31');
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    for (let h = 0; h < 24; h++) {
      const hour = String(h).padStart(2, '0');
      metrics.push({
        timestamp: `${d.toISOString().split('T')[0]}T${hour}:00:00Z`,
        users_active: Math.floor(Math.random() * 500) + 50,
        page_views: Math.floor(Math.random() * 5000) + 500,
        revenue: parseFloat((Math.random() * 1000 + 100).toFixed(2))
      });
    }
  }
  
  return metrics;
}

// Cache generated data in memory
let dailyMetricsCache = null;
let hourlyMetricsCache = null;

function getDailyMetricsData() {
  if (!dailyMetricsCache) {
    console.log('Generating daily metrics data...');
    dailyMetricsCache = generateMockDailyMetrics();
  }
  return dailyMetricsCache;
}

function getHourlyMetricsData() {
  if (!hourlyMetricsCache) {
    console.log('Generating hourly metrics data...');
    hourlyMetricsCache = generateMockHourlyMetrics();
  }
  return hourlyMetricsCache;
}

// ============================================================================
// FILTER FUNCTIONS
// ============================================================================
function getDailyMetrics(startDate, endDate) {
  const data = getDailyMetricsData();
  
  if (!startDate && !endDate) {
    // Simulate computation time
    const start = Date.now();
    while (Date.now() - start < 500) {
      // Intentional delay to show cache benefits
    }
    return data;
  }
  
  let filtered = data;
  
  if (startDate) {
    filtered = filtered.filter(d => d.date >= startDate);
  }
  
  if (endDate) {
    filtered = filtered.filter(d => d.date <= endDate);
  }
  
  // Simulate computation time
  const start = Date.now();
  while (Date.now() - start < 500) {
    // Intentional delay to show cache benefits
  }
  
  return filtered;
}

function getHourlyMetrics(startDate, endDate) {
  const data = getHourlyMetricsData();
  
  if (!startDate && !endDate) {
    const start = Date.now();
    while (Date.now() - start < 500) {}
    return data;
  }
  
  let filtered = data;
  
  if (startDate) {
    filtered = filtered.filter(d => d.timestamp.startsWith(startDate));
  }
  
  if (endDate) {
    filtered = filtered.filter(d => d.timestamp.startsWith(endDate));
  }
  
  const start = Date.now();
  while (Date.now() - start < 500) {}
  
  return filtered;
}

module.exports = {
  getDailyMetrics,
  getHourlyMetrics,
  getDailyMetricsData,
  getHourlyMetricsData
};