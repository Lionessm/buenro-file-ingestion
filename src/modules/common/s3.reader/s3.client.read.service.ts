// src/s3/s3.service.ts
import { Injectable } from '@nestjs/common';
import { Readable } from 'stream';
import { chain } from 'stream-chain';
const { parser } = require('stream-json');
const { streamArray } = require('stream-json/streamers/StreamArray');

@Injectable()
export class S3ClientService {
  
    async streamJsonFromUrl() {
      const url = 'https://buenro-tech-assessment-materials.s3.eu-north-1.amazonaws.com/large_generated_data.json'
     // const url = 'https://buenro-tech-assessment-materials.s3.eu-north-1.amazonaws.com/structured_generated_data.json';
      const response = await fetch(url);
    
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    
      // Convert WHATWG ReadableStream to Node.js Readable
      const nodeStream = Readable.from(response.body as any);

      // Streaming JSON parser
      const pipeline = chain([nodeStream, parser(), streamArray()]);
    
      pipeline.on('data', async (data: any) => {
        const record = data.value; // each object in the array
        try {
          console.log(record) // insert into MongoDB
        } catch (err) {
          console.error('Insert failed:', err.message);
        }
      });
  
      return new Promise<void>((resolve, reject) => {
        pipeline.on('end', () => {
          console.log('Finished streaming and inserting.');
          resolve();
        });
        pipeline.on('error', (err) => reject(err));
      });
    }
}
