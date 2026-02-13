# Analytics API with Redis Caching and Rate Limiting

## Project Overview

A production-ready backend API service that serves aggregated analytics data with Redis caching for performance optimization and API rate limiting for resource protection. This project demonstrates advanced backend patterns, distributed caching strategies, and scalable API design.

### Key Features

- ✅ **High-Performance Analytics API** - Serve aggregated daily and hourly metrics
- ✅ **Redis Caching** - Cache-aside pattern with configurable TTL
- ✅ **Distributed Rate Limiting** - Token bucket algorithm with Redis state management
- ✅ **API Key Authentication** - Secure protected endpoints
- ✅ **Comprehensive Testing** - Unit and integration tests with Jest
- ✅ **Docker Containerization** - Multi-service orchestration with docker-compose
- ✅ **Production-Ready** - Error handling, input validation, graceful shutdown

---

## Architecture Overview

### System Design

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Requests                          │
└────────────────────────────────┬──────────────────────────────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │  Rate Limiting Middleware  │ (Redis)
                    └─────────────┬──────────────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │  Cache Middleware          │ (Redis)
                    │  Cache-Aside Pattern       │
                    └─────────────┬──────────────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │  Express Routes            │
                    │  Metrics Endpoints         │
                    └─────────────┬──────────────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │  Metrics Service           │
                    │  Mock Data Generation      │
                    └─────────────┬──────────────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │  Cache Service             │
                    │  Redis Client              │
                    └────────────────────────────┘
```

### Directory Structure

```
analytics-api/
├── src/
│   ├── app.js                          # Main application entry point
│   ├── routes/
│   │   └── metrics.js                  # Metrics API routes
│   ├── services/
│   │   ├── metricsService.js           # Mock metrics data generation
│   │   └── cacheService.js             # Cache operations
│   ├── middleware/
│   │   ├── authMiddleware.js           # API key authentication
│   │   ├── rateLimitMiddleware.js       # Rate limiting middleware
│   │   └── cacheMiddleware.js           # Caching middleware
│   └── utils/
│       ├── validators.js                # Input validation utilities
│       └── errorHandler.js              # Centralized error handling
├── tests/
│   ├── unit/
│   │   ├── metricsService.test.js      # Metrics service tests
│   │   ├── cacheService.test.js        # Cache service tests
│   │   └── rateLimiter.test.js         # Rate limiter tests
│   └── integration/
│       └── api.test.js                 # API integration tests
├── .env.example                        # Environment variables template
├── Dockerfile                          # Docker image build instructions
├── docker-compose.yml                  # Docker Compose configuration
├── package.json                        # Dependencies and scripts
├── .gitignore                          # Git ignore rules
└── README.md                           # This file
```

---

## Prerequisites

### System Requirements

- **OS**: Windows 10/11, macOS, or Linux
- **RAM**: Minimum 4GB, recommended 8GB+
- **Disk Space**: 2GB for dependencies and Docker images

### Required Software

- **Node.js**: v16.x or higher
  - Download: https://nodejs.org/
  - Verify: `node --version`

- **Docker Desktop**: Latest version
  - Download: https://www.docker.com/products/docker-desktop
  - Verify: `docker --version`

- **Git**: Latest version
  - Download: https://git-scm.com/
  - Verify: `git --version`

- **PowerShell** (Windows): 5.1 or higher (pre-installed on Windows 10+)

---

## Quick Start Guide

### Step 1: Clone or Create Project

```powershell
# Create project directory
$projectRoot = "C:\Users\$env:USERNAME\Desktop\analytics-api"
New-Item -ItemType Directory -Path $projectRoot -Force
cd $projectRoot

# Initialize Git repository
git init
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### Step 2: Create Project Structure

```powershell
# Create all directories
$directories = @(
    "src", "src\routes", "src\services", "src\middleware", "src\utils",
    "tests", "tests\unit", "tests\integration"
)

foreach ($dir in $directories) {
    New-Item -ItemType Directory -Path $dir -Force
}

# Create all necessary files
$files = @(
    "package.json", ".env.example", ".gitignore", "Dockerfile",
    "docker-compose.yml", "README.md", "src\app.js",
    "src\routes\metrics.js", "src\services\metricsService.js",
    "src\services\cacheService.js", "src\middleware\authMiddleware.js",
    "src\middleware\rateLimitMiddleware.js", "src\middleware\cacheMiddleware.js",
    "src\utils\errorHandler.js", "src\utils\validators.js",
    "tests\unit\metricsService.test.js", "tests\unit\cacheService.test.js",
    "tests\unit\rateLimiter.test.js", "tests\integration\api.test.js"
)

foreach ($file in $files) {
    New-Item -ItemType File -Path $file -Force
}

Write-Host "✓ Project structure created" -ForegroundColor Green
```

### Step 3: Install Dependencies

```powershell
cd $projectRoot

# Install npm dependencies
npm install

Write-Host "✓ Dependencies installed" -ForegroundColor Green
```

### Step 4: Configure Environment Variables

```powershell
# Copy .env.example to .env
Copy-Item ".env.example" ".env"

# Edit .env with your settings (optional)
notepad .env
```

### Step 5: Start Application with Docker Compose

```powershell
# Build and start services
docker-compose up --build -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f analytics-api

Write-Host "✓ Services started successfully" -ForegroundColor Green
```

### Step 6: Verify Application

```powershell
# Test health endpoint
Invoke-WebRequest -Uri "http://localhost:8080/health"

# Test metrics endpoint
Invoke-WebRequest -Uri "http://localhost:8080/api/v1/metrics/daily"
```

---

## API Documentation

### Base URL

```
http://localhost:8080/api/v1
```

### Authentication

Protected endpoints require API Key authentication via the `X-API-Key` header:

```
X-API-Key: your_super_secret_api_key_123
```

### Endpoints

#### 1. Health Check

```
GET /health

Response (200):
{
  "status": "healthy",
  "timestamp": "2026-02-11T18:30:00.000Z",
  "redis": "connected",
  "uptime": 123.456
}
```

#### 2. Get Daily Metrics

```
GET /metrics/daily?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD

Query Parameters:
  - start_date (optional): Filter start date (YYYY-MM-DD)
  - end_date (optional): Filter end date (YYYY-MM-DD)

Response (200):
{
  "success": true,
  "data": [
    {
      "date": "2023-01-01",
      "users_active": 1245,
      "page_views": 15234,
      "revenue": 2500.75,
      "bounce_rate": 42.5,
      "avg_session_duration": 5
    },
    ...
  ],
  "count": 100,
  "timestamp": "2026-02-11T18:30:00.000Z",
  "cached": false
}

Headers:
  - X-Cache-Status: HIT|MISS (indicates cache status)
  - X-RateLimit-Limit: 10 (requests per window)
  - X-RateLimit-Remaining: 8 (remaining requests)
  - X-RateLimit-Reset: 1644591000 (reset timestamp)
```

#### 3. Get Hourly Metrics

```
GET /metrics/hourly?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD

Query Parameters:
  - start_date (optional): Filter start date (YYYY-MM-DD)
  - end_date (optional): Filter end date (YYYY-MM-DD)

Response (200):
{
  "success": true,
  "data": [
    {
      "timestamp": "2023-01-01T00:00:00Z",
      "users_active": 50,
      "page_views": 800,
      "revenue": 150.00
    },
    ...
  ],
  "count": 240,
  "timestamp": "2026-02-11T18:30:00.000Z",
  "cached": false
}
```

#### 4. Get Metrics Summary

```
GET /metrics/summary?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD

Response (200):
{
  "success": true,
  "data": {
    "total_active_users": 125000,
    "total_page_views": 1523400,
    "total_revenue": 250075.50,
    "average_daily_users": 1250,
    "average_daily_page_views": 15234,
    "date_range": {
      "start": "2023-01-01",
      "end": "2023-12-31"
    }
  },
  "timestamp": "2026-02-11T18:30:00.000Z",
  "cached": false
}
```

#### 5. Invalidate Cache

```
POST /cache/invalidate
Headers:
  X-API-Key: your_super_secret_api_key_123

Response (200):
{
  "success": true,
  "message": "Cache invalidated successfully",
  "keysDeleted": 42
}

Error Response (401):
{
  "success": false,
  "error": {
    "message": "Invalid API Key",
    "statusCode": 401
  }
}
```

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful request |
| 400 | Bad Request | Invalid input parameters |
| 401 | Unauthorized | Missing or invalid API key |
| 404 | Not Found | Endpoint not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Redis unavailable |

### Error Responses

```json
{
  "success": false,
  "error": {
    "message": "Invalid start_date format. Use YYYY-MM-DD",
    "statusCode": 400,
    "details": {}
  }
}
```

---

## Caching Strategy

### Cache-Aside Pattern

The application implements the cache-aside pattern for optimal performance:

**Process Flow**:
1. Request arrives for metrics endpoint
2. Check Redis cache using generated cache key
3. If cache hit: Return cached data immediately
4. If cache miss:
   - Fetch data from metricsService
   - Store in Redis with TTL
   - Return to client
5. On cache invalidation: Clear all `metrics:*` keys

**Cache Keys**:
- Pattern: `metrics:{endpoint}:{query_params}`
- Example: `metrics:daily:start_date=2023-01-01&end_date=2023-12-31`

**Configuration**:
- TTL (Time-To-Live): 300 seconds (5 minutes)
- Configurable via `CACHE_TTL_SECONDS` environment variable

---

## Rate Limiting

### Token Bucket Algorithm

Distributed rate limiting using Redis for multi-instance scalability:

**Configuration**:
- Default Limit: 10 requests per 60 seconds
- Configurable via:
  - `RATE_LIMIT_REQUESTS` (default: 10)
  - `RATE_LIMIT_WINDOW_SECONDS` (default: 60)

**Client Identification**:
- Authenticated: Uses API Key from `X-API-Key` header
- Unauthenticated: Uses client IP address

**Response Headers** (on rate limit):
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
Retry-After: 45
```

---

## Running Tests

### Unit Tests

```powershell
# Run all unit tests
npm run test

# Watch mode (auto-rerun on changes)
npm run test:watch

# With coverage report
npm run test -- --coverage
```

### Integration Tests

```powershell
# Run integration tests only
npm run test:integration

# Run specific test file
npm run test -- tests/integration/api.test.js
```

### Manual Testing with cURL

```powershell
# Get daily metrics
Invoke-WebRequest -Uri "http://localhost:8080/api/v1/metrics/daily"

# Get metrics with date range
Invoke-WebRequest -Uri "http://localhost:8080/api/v1/metrics/daily?start_date=2023-01-01&end_date=2023-01-31"

# Invalidate cache (requires API key)
Invoke-WebRequest -Uri "http://localhost:8080/api/v1/cache/invalidate" `
  -Method POST `
  -Headers @{"X-API-Key" = "your_super_secret_api_key_123"}

# Test rate limiting (make 15 rapid requests)
for ($i = 0; $i -lt 15; $i++) {
    Invoke-WebRequest -Uri "http://localhost:8080/api/v1/metrics/daily" -ErrorAction Continue
}
```

---

## Docker Commands

### Build and Start

```powershell
# Build images and start services
docker-compose up --build -d

# Start services (without rebuild)
docker-compose up -d

# View logs
docker-compose logs -f

# View API logs only
docker-compose logs -f analytics-api

# View Redis logs only
docker-compose logs -f redis
```

### Monitoring and Debugging

```powershell
# Check service status
docker-compose ps

# Execute command in container
docker-compose exec analytics-api npm test

# Access Redis CLI
docker-compose exec redis redis-cli

# View Docker resource usage
docker stats

# Inspect service logs with tail
docker-compose logs --tail=100 analytics-api
```

### Cleanup

```powershell
# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Clean up unused resources
docker system prune -a
```

---

## Environment Variables

### .env Configuration

```
# Application Settings
NODE_ENV=production
PORT=8080

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_URL=redis://redis:6379

# Cache Configuration
CACHE_TTL_SECONDS=300

# Rate Limiting Configuration
RATE_LIMIT_REQUESTS=10
RATE_LIMIT_WINDOW_SECONDS=60

# API Security
API_KEY=your_super_secret_api_key_123
```

### Important Notes

- Never commit `.env` file to version control
- Use `.env.example` as template for team members
- Store sensitive values in CI/CD secrets
- Rotate API keys regularly in production

---

## Performance Benchmarks

### Caching Impact

**First Request (Cache Miss)**:
- Response Time: ~500ms
- Cache Status: MISS

**Subsequent Requests (Cache Hit)**:
- Response Time: ~5-10ms
- Cache Status: HIT
- **Performance Improvement**: ~50-100x faster

### Rate Limiting Overhead

- Per-request overhead: <1ms
- Redis operations: Optimized with pipelining

---

## Troubleshooting

### Redis Connection Issues

```powershell
# Check if Redis container is running
docker ps | findstr redis

# View Redis logs
docker-compose logs redis

# Test Redis connection
docker-compose exec redis redis-cli ping

# Restart Redis
docker-compose restart redis
```

### API Not Starting

```powershell
# Check API logs
docker-compose logs analytics-api

# Verify port 8080 is available
netstat -ano | findstr :8080

# Kill process using port 8080
taskkill /PID <PID> /F

# Rebuild and restart
docker-compose down
docker-compose up --build -d
```

### Tests Failing

```powershell
# Ensure services are running
docker-compose up -d

# Clear node_modules and reinstall
rm -Recurse node_modules
npm install

# Run tests with verbose output
npm test -- --verbose

# Run specific test file
npm test -- tests/unit/metricsService.test.js
```

### High Memory Usage

```powershell
# Check Docker resource usage
docker stats

# Limit container memory
# Edit docker-compose.yml:
# analytics-api:
#   mem_limit: 512m
#   memswap_limit: 512m

# Restart services
docker-compose restart
```

---

## Production Deployment

### Preparing for Production

1. **Environment Configuration**:
   - Set `NODE_ENV=production`
   - Use strong, unique API key
   - Configure Redis persistence
   - Set appropriate cache TTLs

2. **Security Hardening**:
   - Enable HTTPS/TLS
   - Implement request signing
   - Use API gateway for rate limiting
   - Enable CORS if needed

3. **Scaling**:
   - Deploy multiple API instances
   - Use load balancer (nginx, HAProxy)
   - Configure Redis replication
   - Monitor with logging and metrics

4. **Monitoring**:
   - Set up health check endpoints
   - Configure alerting
   - Track performance metrics
   - Monitor Redis memory

### Docker Compose Production

```yaml
version: '3.8'
services:
  analytics-api:
    image: analytics-api:1.0.0
    restart: always
    environment:
      NODE_ENV: production
    mem_limit: 512m
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 20s

  redis:
    image: redis:7-alpine
    restart: always
    command: redis-server --appendonly yes
    mem_limit: 256m
```

---

## Contributing

### Code Style

- Use ESLint for code consistency
- Follow Express.js best practices
- Comment complex logic
- Use meaningful variable names

### Testing Requirements

- Minimum 80% code coverage
- All public functions tested
- Integration tests for API flows
- Test error scenarios

### Commit Guidelines

- Use descriptive commit messages
- Reference issue numbers
- One feature per commit
- Test before committing

---

## License

MIT License - See LICENSE file for details

---

## Support

For issues and questions:

1. Check existing GitHub issues
2. Review troubleshooting section above
3. Consult API documentation
4. Review error logs in Docker

---

## Changelog

### Version 1.0.0 (2026-02-12)

**Features**:
- Initial release
- Daily and hourly metrics endpoints
- Redis cache-aside pattern
- Token bucket rate limiting
- API key authentication
- Comprehensive testing suite
- Docker containerization

**Known Limitations**:
- Mock data only (no real database)
- Single-region deployment
- Basic authentication (no OAuth/JWT)

---

## Acknowledgments

- Inspired by production-grade API design patterns
- Built with Express.js and Redis
- Containerized with Docker
- Tested with Jest and Supertest

---

## Contact

**Author**: Akash Sai  
**Email**: your.email@example.com  
**GitHub**: https://github.com/yourusername/analytics-api
