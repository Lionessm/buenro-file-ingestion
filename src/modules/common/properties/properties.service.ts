import { Injectable, Logger } from '@nestjs/common';
import { PropertiesRepository } from '../database/repositories/propertiesDb.repository';
import { PropertyFields, PropertyFilter, PropertyPagination, PropertySort } from './types';

@Injectable()
export class PropertiesService {
  private readonly logger = new Logger(PropertiesService.name);

  constructor(
    private readonly propertiesRepository: PropertiesRepository,
  ) {}

  async searchProperties(filter: PropertyFilter, sort: PropertySort, pagination: PropertyPagination, fields: PropertyFields) {
    try {
      const query: any = {};
      
      if (filter.country) {
        query['data.location.country'] = filter.country;
      }
      
      if (filter.city) {
        query['data.location.city'] = filter.city;
      }
      
      // Availability filter - direct field access
      if (filter.isAvailable !== undefined) {
        query['data.isAvailable'] = filter.isAvailable;
      }
      
      // Price filters - consolidated and optimized
      const priceConditions: any = {};
      if (filter.minPrice !== undefined) priceConditions.$gte = filter.minPrice;
      if (filter.maxPrice !== undefined) priceConditions.$lte = filter.maxPrice;
      
      // Handle priceRange format
      if (filter.priceRange) {
        if (filter.priceRange.min !== undefined) priceConditions.$gte = filter.priceRange.min;
        if (filter.priceRange.max !== undefined) priceConditions.$lte = filter.priceRange.max;
      }
      
      // Handle price comparison
      if (filter.priceComparison && filter.priceValue !== undefined) {
        priceConditions[`$${filter.priceComparison}`] = filter.priceValue;
      }
      
      // Apply price conditions if any exist
      if (Object.keys(priceConditions).length > 0) {
        query['data.priceForNight'] = priceConditions;
      }

      // Price segment filter - direct match for normalized data
      if (filter.priceSegment) {
        query['data.priceSegment'] = filter.priceSegment;
      }
      
      // Property name filter - case insensitive regex
      if (filter.propertyName) {
        query['data.name'] = { $regex: filter.propertyName, $options: 'i' };
      }
      
      // Text search across normalized fields - optimized
      if (filter.searchTerm) {
        query.$or = [
          { 'data.name': { $regex: filter.searchTerm, $options: 'i' } },
          { 'data.location.city': { $regex: filter.searchTerm, $options: 'i' } },
          { 'data.location.country': { $regex: filter.searchTerm, $options: 'i' } }
        ];
      }
      
      // Date filters - optimized
      if (filter.createdAfter || filter.createdBefore) {
        query.createdAt = {};
        if (filter.createdAfter) {
          query.createdAt.$gte = new Date(filter.createdAfter);
        }
        if (filter.createdBefore) {
          query.createdAt.$lte = new Date(filter.createdBefore);
        }
      }
      
      // Source and batch filters - direct field access
      if (filter.source) {
        query.source = filter.source;
      }

      // Build optimized sort object for normalized structure
      const sortQuery: any = {};
      
      // Location sorting
      if (sort.country) {
        sortQuery['data.location.country'] = sort.country;
      }
      if (sort.city) {
        sortQuery['data.location.city'] = sort.city;
      }
      
      // Price and availability sorting
      if (sort.price) {
        sortQuery['data.priceForNight'] = sort.price;
      }
      if (sort.availability) {
        sortQuery['data.isAvailable'] = sort.availability;
      }
      
      // Property name sorting
      if (sort.name) {
        sortQuery['data.name'] = sort.name;
      }
      
      // Metadata sorting
      if (sort.createdAt) {
        sortQuery.createdAt = sort.createdAt;
      }
      
      // Default sort by creation date if no sort specified
      if (Object.keys(sortQuery).length === 0) {
        sortQuery.createdAt = -1;
      }

      // Build optimized projection for normalized data structure
      const projection: any = {};
      
      if (!fields.includeAll) {
        // Include only requested fields for better performance
        
        // Always include ID for response mapping
        projection.originalId = 1;
        
        // Metadata fields
        if (fields.includeMetadata) {
          projection._id = 1;
          projection.source = 1;
          projection.batchId = 1;
          projection.createdAt = 1;
        }
        
        // Location fields
        if (fields.includeLocation) {
          projection['data.location'] = 1;
        }
        
        // Price fields
        if (fields.includePrice) {
          projection['data.priceForNight'] = 1;
          projection['data.priceSegment'] = 1;
        }
        
        // Availability fields
        if (fields.includeAvailability) {
          projection['data.isAvailable'] = 1;
        }
        
        // Property name fields
        if (fields.includeName) {
          projection['data.name'] = 1;
        }
      }

      // Execute optimized query for normalized data
      const limit = Math.min(pagination.limit || 100, 1000);
      const skip = pagination.skip || 0;
      
      // Execute query
      const documents = await this.propertiesRepository.findWithQuery({
        query,
        sort: sortQuery,
        limit,
        skip,
        projection: Object.keys(projection).length > 0 ? projection : undefined
      });

      // Get total count for pagination
      const totalCount = await this.propertiesRepository.countWithQuery(query);

      // Transform response to optimized format for normalized data
      const properties = documents.map(doc => ({
        id: doc.originalId,
        name: doc.data?.name,
        location: {
          country: doc.data?.location?.country,
          city: doc.data?.location?.city
        },
        price: doc.data?.priceForNight,
        priceSegment: doc.data?.priceSegment,
        available: doc.data?.isAvailable,
        metadata: {
          source: doc.source,
          batchId: doc.batchId,
          createdAt: doc.createdAt
        }
      }));

      return {
        success: true,
        data: properties,
        pagination: {
          total: totalCount,
          limit,
          skip,
          hasMore: (skip + limit) < totalCount
        },
        searchCriteria: {
          filter,
          sort,
          fields
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }
}