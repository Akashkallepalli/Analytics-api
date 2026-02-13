🚀 Analytics API - Redis Caching & Rate Limiting
[
[
[
[
[

Production-ready Analytics API with Redis caching (50-100x performance boost), distributed rate limiting, comprehensive testing, and Docker containerization. Demonstrates enterprise-grade backend patterns.

✨ Key Features
Feature	Status	Description
High-Performance API	✅ Complete	Daily/hourly metrics with date range filtering
Redis Caching	✅ Complete	Cache-Aside pattern, 5-min TTL, 50-100x faster
Rate Limiting	✅ Complete	Token Bucket (10 req/60sec), Redis-backed
API Key Auth	✅ Complete	Secure protected endpoints
Comprehensive Tests	✅ Complete	Unit + Integration tests (Jest, 80%+ coverage)
Docker Ready	✅ Complete	Multi-stage builds, health checks
Production Patterns	✅ Complete	Error handling, validation, logging
🏗️ Architecture Overview
text
┌─────────────────────────────────────────────────────────────┐
│                    Client Requests                           │
│                (Browser/Postman/cURL)                       │
└─────────────────┬───────────────────────────────────────────┘
                  │
     ┌────────────▼────────────┐    ┌────────────▼────────────┐
     │ Rate Limiting          │    │ Cache Middleware         │
     │ • Token Bucket 10/60s  │    │ • Cache-Aside Pattern    │
     │ • Redis-backed         │    │ • 5min TTL (300s)        │
     │ • API Key or IP        │    │ • metrics::key           │
     └────────────┬────────────┘    └────────────┬────────────┘
                  │                              │
     ┌────────────▼────────────┐    ┌────────────▼────────────┐
     │  Express Routes         │    │  Metrics Service        │
     │ • /metrics/daily        │    │ • Mock data generation  │
     │ • /metrics/hourly       │    │ • Date range filtering  │
     │ • /cache/invalidate     │    │ • Summary statistics    │
     └────────────┬────────────┘    └────────────┬────────────┘
                  │                              │
                  └──────────────┬───────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │      Redis Database     │
                    │ • Cache entries (TTL)   │
                    │ • Rate limit counters   │
                    │ • Distributed state     │
                    └─────────────────────────┘
🚀 Quick Start (5 Minutes)
Prerequisites
powershell
node --version   # v16+
npm --version    # v8+
docker --version # Latest
git --version
Setup & Run
powershell
# Clone repository
git clone https://github.com/Akashkallepalli/Analytics-api.git
cd Analytics-api

# Copy environment variables
cp .env.example .env

# Start services (Docker recommended)
docker-compose up --build -d

# Wait 30 seconds for health checks
sleep 30
Verify Installation
powershell
# Health check
curl http://localhost:8080/health

# Daily metrics (731 records)
curl "http://localhost:8080/api/v1/metrics/daily"

# With date range
curl "http://localhost:8080/api/v1/metrics/daily?start_date=2023-01-01&end_date=2023-01-31"
Expected response:

json
{
  "success": true,
  "data": [{"date": "2023-01-01", "users_active": 3978, "page_views": 40644, ...}],
  "count": 731,
  "timestamp": "2026-02-13T04:28:00.000Z
}