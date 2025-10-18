import { Injectable, Logger } from '@nestjs/common';
import { Transform } from 'stream';
const { parser } = require('stream-json');
const { streamArray } = require('stream-json/streamers/StreamArray');
import { pipeline } from 'stream/promises';
import axios from 'axios';
import { PropertiesDbService } from '../../database/services/propertiesDb.service';
import { NormalizedLocationData } from '../types/NormalizedLocationData';
import { PriceSegment } from '../../properties/types/propertySearchFilter.type';
import { isStructureA, isStructureB , LocationInputData } from '../types/InputStructureType';
import { structureMappings } from '../mappings/structuredMappings';

@Injectable()
export class ParserService {
  private readonly logger = new Logger(ParserService.name);
  private batchSize = 100;

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
      
      // Generate a unique batch ID === this was used for testing purposes - is optional
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

  normalizeBatchData(batch: LocationInputData[]): NormalizedLocationData[] {
    return batch.map(item => this.normalizeItemNew(item));
  }

  calculatePriceSegment(price: number): PriceSegment | 'unknown' {
    if (!price || typeof price !== 'number') return 'unknown';
    
    if (price < 300) return PriceSegment.LOW;
    if (price < 700) return PriceSegment.MEDIUM;
    return PriceSegment.HIGH;
  }

  private normalizeItemNew(item: LocationInputData): NormalizedLocationData {
    let structureType: keyof typeof structureMappings | null = null;
  
    if (isStructureA(item)) structureType = 'structureA';
    else if (isStructureB(item)) structureType = 'structureB';
    else structureType = null;
  
    if (!structureType) {
      // throw error if unknown structure
      throw new Error(`Unknown data structure detected for item: ${JSON.stringify(item)}`)
    }
  
    const mapping = structureMappings[structureType];
    return {
      id: mapping.id(item) || null,
      name: mapping.name(item),
      location: mapping.location(item),
      isAvailable: mapping.isAvailable(item),
      priceForNight: mapping.priceForNight(item),
      priceSegment: mapping.priceSegment(item, this),
      originalData: item,
    };
  }
}
