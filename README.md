# Buenro File Ingestion

A NestJS application that automatically ingests and processes large JSON files from S3, normalizes the data, and provides a flexible API for searching properties with advanced filtering and validation.

## 🚀 Features

- **Automated S3 Data Ingestion**: Cron job that runs every 30 seconds to fetch and process JSON files
- **Data Normalization**: Converts different data structures into a consistent format
- **Duplicate Prevention**: MongoDB unique compound indexes prevent duplicate insertions
- **Advanced Search API**: RESTful API with comprehensive filtering, sorting, and pagination
- **Input Validation**: Global validation pipe with Joi and class-validator
- **Type Safety**: Full TypeScript support with DTOs and interfaces
- **Docker Support**: MongoDB containerized with Docker Compose

## 🏗️ Architecture

### Data Flow
1. **Cron Job** → Fetches JSON files from S3 every 30 seconds
2. **Parser Service** → Streams and processes large JSON files
3. **Data Normalization** → Converts different structures to consistent format
4. **MongoDB Insertion** → Stores normalized data with duplicate prevention
5. **Search API** → Provides flexible querying with validation

### Key Components
- **ReaderJobService**: Scheduled cron job for S3 data ingestion
- **ParserService**: Handles JSON streaming and data normalization
- **PropertiesService**: Business logic for property operations
- **PropertiesController**: REST API endpoints with validation
- **PropertiesRepository**: MongoDB data access layer

## 📦 Installation

```bash
# Install dependencies
$ npm install
```

## 🐳 Docker Setup

```bash
# Start MongoDB container
$ docker-compose up -d

# Stop and remove containers (including data)
$ docker-compose down -v
```

## 🚀 Running the Application

```bash
# Development mode
$ npm run start:dev

# Production mode
$ npm run start:prod

# Build application
$ npm run build
```

## 📊 Data Processing

### Cron Job Configuration
- **Frequency**: Every 30 seconds (`EVERY_30_SECONDS`)
- **Concurrency Control**: Prevents overlapping job executions
- **Error Handling**: Graceful error handling with logging

### Data Normalization
The application handles two different input structures:

**Structure A:**
```json
{
  "id": 272805,
  "name": "Lakeview House",
  "address": {
    "country": "Brazil",
    "city": "Fortaleza"
  },
  "isAvailable": true,
  "priceForNight": 421
}
```

**Structure B:**
```json
{
  "id": "abc12345",
  "city": "Sydney",
  "availability": true,
  "priceSegment": "medium",
  "pricePerNight": 350
}
```

**Normalized Output:**
```json
{
  "id": "272805",
  "name": "Lakeview House",
  "location": {
    "country": "Brazil",
    "city": "Fortaleza"
  },
  "isAvailable": true,
  "priceForNight": 421,
  "priceSegment": "medium",
  "originalData": { ... }
}
```

### MongoDB Configuration
- **Database**: `buenro_db`
- **Collection**: `propertiesmodel`
- **Unique Index**: `(source, originalId)` prevents duplicates
- **Additional Indexes**: `createdAt`, `source`, `batchId` for performance

### Duplicate Prevention
The application uses MongoDB's unique compound index on `(source, originalId)` to prevent duplicate insertions. When duplicates are encountered:
- The application gracefully skips duplicates
- Continues processing other records
- Logs the number of skipped duplicates
- Only throws errors for non-duplicate issues (connection problems, etc.)

## 🔍 API Documentation

### Search Properties
**Endpoint**: `POST /properties/search`

**Request Body:**
```json
{
  "filter": {
    "country": "Brazil",
    "city": "Fortaleza",
    "minPrice": 200,
    "maxPrice": 500,
    "priceSegment": "medium",
    "isAvailable": true,
    "searchTerm": "lakeview"
  },
  "sort": {
    "price": 1,
    "createdAt": -1
  },
  "pagination": {
    "limit": 100,
    "skip": 0
  },
  "fields": {
    "includeLocation": true,
    "includePrice": true,
    "includeAvailability": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "272805",
      "name": "Lakeview House",
      "location": {
        "country": "Brazil",
        "city": "Fortaleza"
      },
      "price": 421,
      "priceSegment": "medium",
      "available": true,
      "metadata": {
        "source": "s3://bucket/file.json",
        "batchId": "batch_123",
        "createdAt": "2025-01-18T15:38:30.403Z"
      }
    }
  ],
  "pagination": {
    "total": 1500,
    "limit": 100,
    "skip": 0,
    "hasMore": true
  },
  "searchCriteria": {
    "filter": { "country": "Brazil" },
    "sort": { "createdAt": -1 },
    "fields": { "includeAll": true }
  }
}
```

### Available Filters
- **Location**: `country`, `city` (supports partial matching)
- **Price**: `minPrice`, `maxPrice`, `priceRange`, `priceComparison`, `priceValue`, `priceSegment`
- **Property**: `propertyName`, `searchTerm` (supports partial matching)
- **Availability**: `isAvailable`
- **Dates**: `createdAfter`, `createdBefore`
- **Metadata**: `source`, `batchId`

### Sorting Options
- **Fields**: `country`, `city`, `price`, `availability`, `name`, `createdAt`
- **Values**: `1` (ascending) or `-1` (descending)

## 🛡️ Validation

### Global Validation Pipe
The application uses NestJS's global validation pipe with:
- **Transform**: Automatic type conversion
- **Whitelist**: Strip unknown properties
- **Forbid Non-Whitelisted**: Throw errors for unknown fields
- **Implicit Conversion**: Auto-convert compatible types

### Validation Rules
- **Numbers**: Min/max constraints, type validation
- **Strings**: Optional string validation with partial matching
- **Enums**: Valid values for `priceSegment`, `priceComparison`, sort directions
- **Dates**: ISO date string validation
- **Nested Objects**: Proper validation for complex structures

## 🧪 Testing

```bash
# Unit tests
$ npm run test

# End-to-end tests
$ npm run test:e2e

# Test coverage
$ npm run test:cov
```

## 🚨 Error Handling

The application includes comprehensive error handling:
- **Validation Errors**: Automatic 400 responses with detailed messages
- **Database Errors**: Graceful handling of connection issues
- **Duplicate Errors**: Automatic skipping with logging
- **Streaming Errors**: Proper error propagation in data processing
- **Job Errors**: Prevents job corruption and maintains state

## 📈 Performance Features

- **Streaming Processing**: Handles large JSON files without memory issues
- **Batch Processing**: Processes data in configurable batches (default: 15 items)
- **Database Indexes**: Optimized queries with proper indexing
- **Connection Pooling**: Efficient database connection management
- **Pagination**: Configurable pagination with limits (max 1000 items per request)

## 🔄 Monitoring & Logging

- **Structured Logging**: Comprehensive logging with NestJS Logger
- **Job Monitoring**: Logs job execution status and performance metrics
- **Error Tracking**: Detailed error logging with stack traces