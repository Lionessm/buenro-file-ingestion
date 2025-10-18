import { Injectable, Logger } from '@nestjs/common';
import { Transform } from 'stream';
const { parser } = require('stream-json');
const { streamArray } = require('stream-json/streamers/StreamArray');
import { pipeline } from 'stream/promises';
import axios from 'axios';
import { PropertiesDbService } from '../../database/services/propertiesDb.service';
import { NormalizedLocationData } from '../types/NormalizedLocationData';

@Injectable()
export class ParserService { // or ingester service
  private readonly logger = new Logger(ParserService.name);
  private batchSize = 15;

  constructor(
    private readonly propertiesDbService: PropertiesDbService,
  ) {}

  async streamJsonFromUrl(url: string) {
    const batch: any[] = [];
    let totalProcessed = 0;
    
    try {
      this.logger.log('Starting to stream JSON from URL...');

      const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream',
        timeout: 0, // No timeout for large files
      });
      
      const nodeStream = response.data;
      
      await pipeline(
        nodeStream, 
        parser(),
        streamArray(),
        this.ingestData(batch, url, () => totalProcessed++)
      )
      
      this.logger.log(`Pipeline processing completed successfully. Total items processed: ${totalProcessed}`);
      
    } catch (error) {
      this.logger.error('Error in streamJsonFromUrl:', error.message);
      throw error;
    }
  }

  ingestData(batch: any[], source: string, incrementCounter: () => void) {
    const that = this;
    let itemCount = 0;

    return new Transform({
      objectMode: true,
      transform(data, encoding, callback) {
        try {
          batch.push(data.value);
          incrementCounter();
          itemCount++;
          that.logger.log(`Total items processed: ${itemCount}, Batch size: ${batch.length}, Item ID:`, data.value.id || 'unknown');
          
          if (batch.length >= that.batchSize) {
            that.ingestBatch(batch, source)
              .then(() => {
                batch = [];
                callback(null);
              })
              .catch((err) => callback(err));
          } else {
            callback(null);
          }
        } catch (error) {
          that.logger.error('Error in transform:', error);
          callback(error);
        }
      },
      flush(callback) {
        that.logger.log(`Flush called with ${batch.length} remaining items`);
        if (batch.length > 0) {
          that.ingestBatch(batch, source); // Process remaining items
          batch = [];
        }
        callback();
      }
    });
  }

  async ingestBatch(batch: any[], source: string): Promise<void> {
    try {
      this.logger.log(`Processing batch of ${batch.length} items`);
      
      // Normalize the batch data to consistent structure
      const normalizedBatch = this.normalizeBatchData(batch);
      this.logger.log(`Normalized ${batch.length} items to consistent structure`);
      
      // Generate a unique batch ID
      const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Insert normalized batch into MongoDB
      const insertedCount = await this.propertiesDbService.insertBatch(
        normalizedBatch, 
        source,
        batchId
      );
      
      this.logger.log(`Successfully inserted ${insertedCount} normalized documents in batch ${batchId}`);
    } catch (error) {
      this.logger.error(`Failed to process batch: ${error.message}`, error.stack);
      throw error;
    }
  }

  normalizeBatchData(batch: any[]): NormalizedLocationData[] {
    return batch.map(item => this.normalizeItem(item));
  }

  private normalizeItem(item: any): NormalizedLocationData {
    // Check if it's Structure A (has 'name' and 'address')
    if (item.name && item.address && item.address.country && item.address.city) {
      return {
        id: item.id?.toString() || null,
        name: item.name || null,
        location: {
          country: item.address.country || null,
          city: item.address.city || null
        },
        isAvailable: item.isAvailable !== undefined ? item.isAvailable : null,
        priceForNight: item.priceForNight || null,
        priceSegment: this.calculatePriceSegment(item.priceForNight),
        // Keep original data for reference
        originalData: item
      };
    }
    
    // Check if it's Structure B (has 'city' and 'priceSegment')
    if (item.city && item.priceSegment && item.pricePerNight !== undefined) {
      return {
        id: item.id || null,
        name: null, // Structure B doesn't have name
        location: {
          country: null, // Structure B doesn't have country
          city: item.city || null
        },
        isAvailable: item.availability !== undefined ? item.availability : null,
        priceForNight: item.pricePerNight || null,
        priceSegment: item.priceSegment || null,
        // Keep original data for reference
        originalData: item
      };
    }
    
    // Unknown structure - return as-is with normalized fields
    this.logger.warn(`Unknown data structure detected for item: ${JSON.stringify(item)}`); // presuming we will know the source
  }

  private calculatePriceSegment(price: number): 'low' | 'medium' | 'high' | 'unknown' {
    if (!price || typeof price !== 'number') return 'unknown';
    
    if (price < 300) return 'low';
    if (price < 700) return 'medium';
    return 'high';
  }
}
