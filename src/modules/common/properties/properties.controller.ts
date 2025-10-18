import { Controller, Post, Body } from '@nestjs/common'
import { PropertiesService } from './properties.service';
import { PropertySearchRequestDto } from './dto/propertySearchRequest.dto';

@Controller('properties')
export class PropertiesController {
  constructor(
    private readonly propertiesService: PropertiesService,
  ) {}

  @Post('/search')
  async searchProperties(@Body() request: PropertySearchRequestDto) {
    const {
      filter = {},
      sort = { createdAt: -1 },
      pagination = { limit: 100, skip: 0 },
      fields = { includeAll: true }
    } = request;

    return await this.propertiesService.searchProperties(filter, sort, pagination, fields);
  }
}
