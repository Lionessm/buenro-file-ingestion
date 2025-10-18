import { Controller, Post, Body } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { PropertySearchRequestType } from './types/propertySearchRequest.type';
import { PropertyFields, PropertyFilter, PropertyPagination, PropertySort } from './types';

@Controller('properties')
export class PropertiesController {
  constructor(
    private readonly propertiesService: PropertiesService,
  ) {}

  @Post('/search')
  async searchProperties(@Body() request: PropertySearchRequestType) {
    const {
      filter = {},
      sort = { createdAt: -1 },
      pagination = { limit: 100, skip: 0 },
      fields = { includeAll: true }
    } = request;

    return await this.propertiesService.searchProperties(filter as PropertyFilter, sort as PropertySort, pagination as PropertyPagination, fields as PropertyFields);
  }
}
