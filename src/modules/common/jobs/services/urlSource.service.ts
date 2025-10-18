import { Injectable } from '@nestjs/common';

@Injectable()
export class UrlSourceService {
  getUrls(): string[] {
    return [
      'https://buenro-tech-assessment-materials.s3.eu-north-1.amazonaws.com/structured_generated_data.json',
      'https://buenro-tech-assessment-materials.s3.eu-north-1.amazonaws.com/large_generated_data.json',
      // Add more URLs here alternatively - use env variable
    ];
  }
}
