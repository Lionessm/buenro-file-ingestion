import { Injectable, Logger } from '@nestjs/common';
import { Readable, Transform } from 'stream';
const { parser } = require('stream-json');
const { streamArray } = require('stream-json/streamers/StreamArray');
import { pipeline } from 'stream/promises';
import axios from 'axios';
import * as https from 'https'; 


@Injectable()
export class ParserService {
  private readonly logger = new Logger(ParserService.name);
  private batchSize = 10;

  async streamJsonFromUrl() {
    // Create local state for this processing session
    const batch: any[] = [];
    let totalProcessed = 0;
    
    try {
      this.logger.log('Starting to stream JSON from URL...');
      
       const url = 'https://buenro-tech-assessment-materials.s3.eu-north-1.amazonaws.com/large_generated_data.json';
       //const url = 'https://buenro-tech-assessment-materials.s3.eu-north-1.amazonaws.com/structured_generated_data.json';
      
      this.logger.log(`Fetching data from: ${url}`);

      const agent = new https.Agent({
        keepAlive: true,
        keepAliveMsecs: 30000,
        maxSockets: 50,
      });

      const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream',
        timeout: 0, // No timeout for large files
        httpsAgent: agent,
      });
      
      const nodeStream = response.data;
      
      await pipeline(
        nodeStream, 
        parser(),
        streamArray(),
        this.ingestData(batch, () => totalProcessed++)
      )
      
      this.logger.log(`Pipeline processing completed successfully. Total items processed: ${totalProcessed}`);
      
    } catch (error) {
      this.logger.error('Error in streamJsonFromUrl:', error.message);
      throw error;
    }
  }

    // batch de 100 si bagat in repo mongoose
    ingestData(batch: any[], incrementCounter: () => void) {
      const that = this;
      let itemCount = 0;
      return new Transform({
        objectMode: true,
        transform(data, encoding, callback) {
          try {
            batch.push(data.value);
            incrementCounter();
            itemCount++;
            console.log(`Total items processed: ${itemCount}, Batch size: ${batch.length}, Item ID:`, data.value.id || 'unknown');
            
            if (batch.length >= that.batchSize) {
              // Pause the stream during batch processing
              this.pause();
              
              that.ingestBatch(batch).then(() => {
                batch.length = 0; // Clear the batch
                // Resume the stream after processing
                this.resume();
                callback(null, data);
              }).catch((error) => {
                console.error('Batch processing error:', error);
                this.resume();
                callback(error);
              });
            } else {
              callback(null, data);
            }
          } catch (error) {
            console.error('Error in transform:', error);
            callback(error);
          }
        },
        flush(callback) {
          that.logger.log(`Flush called with ${batch.length} remaining items`);
          if (batch.length > 0) {
            that.ingestBatch(batch); // Process remaining items
            batch = [];
          }
          callback();
        }
      });
    }

    async ingestBatch(batch: any[]) {
      this.logger.log(`Processing batch of ${batch.length} items`);
      // TODO: this mongo service insert many
      console.log('Batch data:', batch);
      return;
    }
}
