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
5. **Search API** → Provides querying with validation

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
- **Concurrency Control**: The `jobRunning` flag prevents overlapping job executions
  - If a job is already running, subsequent cron triggers are skipped
  - Prevents data corruption and memory issues from concurrent processing
  - Ensures only one data ingestion process runs at a time
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
- **Collection**: `properties`
- **Unique Index**: `(source, originalId)` prevents duplicates

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


## 📈 Performance Features

- **Streaming Processing**: Handles large JSON files without memory issues
- **Batch Processing**: Processes data in configurable batches (default: 15 items)
- **Pagination**: Configurable pagination with limits (max 1000 items per request)


## 🔧 Extending the Solution for New Data Structures

The application uses a mapping-based architecture to handle different data structures. This makes it extremely easy to add support for new external JSON sources. Here's how to extend the solution:

### Architecture Overview

The system uses:
- **Type Guards**: Functions that identify different data structures
- **Structure Mappings**: Configuration objects that define how to normalize each structure
- **Extensible Parser**: Automatically handles new structures through the mapping system

### Step-by-Step Extension Process

#### 1. Define New Input Structure Type

Create a new type in `src/modules/common/jobs/types/InputStructureType.ts`:

```typescript
// New structure type
export type StructureCInput = {
  propertyId: string;
  title: string;
  geoLocation: {
    countryCode: string;
    cityName: string;
  };
  pricing: {
    nightlyRate: number;
    currency: string;
  };
  availabilityStatus: boolean;
  propertyType: string;
};

// Update the union type
export type LocationInputData = StructureAInput | StructureBInput | StructureCInput;

// Add type guard function
export function isStructureC(data: LocationInputData): data is StructureCInput {
  return 'geoLocation' in data && 'pricing' in data && 'propertyType' in data;
}
```

#### 2. Add Structure Mapping

Update `src/modules/common/jobs/mappings/structuredMappings.ts`:

```typescript
export const structureMappings = {
  // Add new structure mapping
  structureC: {
    id: (item: any) => item.propertyId || null,
    name: (item: any) => item.title || null,
    location: (item: any) => ({
      country: item.geoLocation?.countryCode || null,
      city: item.geoLocation?.cityName || null,
    }),
    isAvailable: (item: any) => item.availabilityStatus !== undefined ? item.availabilityStatus : null,
    priceForNight: (item: any) => item.pricing?.nightlyRate || null,
    priceSegment: (item: any, that: any) => that.calculatePriceSegment(item.pricing?.nightlyRate),
  }
};
```

#### 3. Update Parser Service

Modify `src/modules/common/jobs/services/parser.service.ts`:

```typescript

  else if (isStructureC(item)) structureType = 'structureC'; // Add new structure

```

#### 4. Add New Data Source Configuration

Update the URL source in UrlSourceService service

#### 5. Extend API Filters (Optional)

If new fields need to be searchable, update the DTOs and service:

```typescript
// In PropertyFilterDto
@IsOptional()
@IsString()
propertyType?: string;

@IsOptional()
@IsString()
currency?: string;

// In properties.service.ts - add new filter logic
if (filter.propertyType) {
  query['data.originalData.propertyType'] = { $regex: filter.propertyType, $options: 'i' };
}
```

#### 6. Update Database Schema (If Needed)

If new fields need to be indexed for performance:

```javascript
// In docker/mongo-init.js
db.properties.createIndex({ "data.originalData.propertyType": 1 });
db.properties.createIndex({ "data.originalData.currency": 1 });
```

### Key Benefits of This Mapping-Based Approach

- **✅ Configuration-Driven**: Adding new structures requires minimal code changes
- **✅ Type Safety**: Full TypeScript support for all structures
- **✅ Modular Design**: Each structure mapping is independent
- **✅ Easy Testing**: Can test new structures in isolation
- **✅ Maintainable**: Clear separation between structure detection and normalization
- **✅ Flexible**: Can handle any number of new data sources

This mapping-based architecture allows you to support any number of new data sources with minimal code changes while maintaining full type safety and extensibility.