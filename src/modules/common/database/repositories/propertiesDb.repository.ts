import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PropertiesDocument, PropertiesModel } from '../models/propertiesDb.model';


@Injectable()
export class PropertiesRepository {
  private readonly logger = new Logger(PropertiesRepository.name);

  constructor(
    @InjectModel(PropertiesModel.name) private documentModel: Model<PropertiesDocument>,
  ) {}

  async insertMany(documents: any[], source: string, batchId?: string): Promise<PropertiesDocument[]> {
    try {
      const documentsToInsert = documents.map(doc => ({
        data: doc,
        source,
        batchId,
        originalId: doc.id || doc._id || null,
      }));

      const result = await this.documentModel.insertMany(documentsToInsert, {
        ordered: false, // Continue inserting even if some fail due to duplicates
      });

      this.logger.log(`Successfully inserted ${result.length} documents from ${source}`);
      return result;
    } catch (error) {
      // Only handle duplicate key errors - skip duplicates and continue
      if (error.name === 'BulkWriteError' || error.name === 'MongoBulkWriteError') {
        const insertedCount = error.result?.insertedCount || 0;
        const duplicateCount = error.result?.writeErrors?.length || 0;
        
        this.logger.log(`Inserted ${insertedCount} new documents, skipped ${duplicateCount} duplicates from ${source}`);
        
        // Return the successfully inserted documents
        return error.result?.insertedIds ? 
          await this.documentModel.find({ _id: { $in: Object.values(error.result.insertedIds) } }) :
          [];
      }
      
      // All other errors should throw err
      // This will stop the job and allow for proper error handling at higher levels
      this.logger.error(`Error during batch insert: ${error.name} - ${error.message}`, error.stack);
      throw error;
    }
  }

  async findWithQuery(options: {
    query: any;
    sort?: any;
    limit?: number;
    skip?: number;
    projection?: any;
  }): Promise<PropertiesDocument[]> {
    const { query, sort = { createdAt: -1 }, limit = 100, skip = 0, projection } = options;
    
    let queryBuilder = this.documentModel.find(query);
    
    if (sort) queryBuilder = queryBuilder.sort(sort);
    if (limit) queryBuilder = queryBuilder.limit(limit);
    if (skip) queryBuilder = queryBuilder.skip(skip);
    if (projection) queryBuilder = queryBuilder.select(projection);
    
    return queryBuilder.exec();
  }

  async countWithQuery(query: any): Promise<number> {
    return this.documentModel.countDocuments(query).exec();
  }
}
