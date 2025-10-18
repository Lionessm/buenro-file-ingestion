import { Injectable, Logger } from '@nestjs/common';
import { PropertiesRepository } from '../repositories/propertiesDb.repository';

@Injectable()
export class PropertiesDbService {
  private readonly logger = new Logger(PropertiesDbService.name);

  constructor(
    private readonly propertiesRepository: PropertiesRepository,
  ) {}

  async insertBatch(documents: any[], source: string, batchId?: string): Promise<number> {
    try {
      const result = await this.propertiesRepository.insertMany(documents, source, batchId);
      return result.length;
    } catch (error) {
      this.logger.error(`Failed to process batch: ${error.message}`, error.stack);
      throw error;
    }
  }
}
