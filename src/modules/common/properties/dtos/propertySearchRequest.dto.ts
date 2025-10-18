import { Type } from 'class-transformer';
import { IsOptional, IsString, IsNumber, IsBoolean, IsDateString, IsObject, ValidateNested, IsIn, Min, Max } from 'class-validator';
import { PriceComparison, PriceSegment } from '../types/propertySearchFilter.type';

export class PropertyFilterDto {
  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  priceRange?: {
    min?: number;
    max?: number;
  };

  @IsOptional()
  @IsString()
  @IsIn(['gte', 'lte', 'gt', 'lt', 'eq'])
  priceComparison?: PriceComparison;

  @IsOptional()
  @IsNumber()
  @Min(0)
  priceValue?: number;

  @IsOptional()
  @IsString()
  @IsIn(['low', 'medium', 'high'])
  priceSegment?: PriceSegment;

  @IsOptional()
  @IsString()
  propertyName?: string;

  @IsOptional()
  @IsString()
  searchTerm?: string;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @IsDateString()
  createdAfter?: string;

  @IsOptional()
  @IsDateString()
  createdBefore?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  batchId?: string;
}

export class PropertySortDto {
  @IsOptional()
  @IsNumber()
  @IsIn([1, -1])
  country?: 1 | -1;

  @IsOptional()
  @IsNumber()
  @IsIn([1, -1])
  city?: 1 | -1;

  @IsOptional()
  @IsNumber()
  @IsIn([1, -1])
  price?: 1 | -1;

  @IsOptional()
  @IsNumber()
  @IsIn([1, -1])
  availability?: 1 | -1;

  @IsOptional()
  @IsNumber()
  @IsIn([1, -1])
  name?: 1 | -1;

  @IsOptional()
  @IsNumber()
  @IsIn([1, -1])
  createdAt?: 1 | -1;
}

export class PropertyPaginationDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  limit?: number = 100;

  @IsOptional()
  @IsNumber()
  @Min(0)
  skip?: number = 0;
}

export class PropertyFieldsDto {
  @IsOptional()
  @IsBoolean()
  includeAll?: boolean = true;

  @IsOptional()
  @IsBoolean()
  includeLocation?: boolean;

  @IsOptional()
  @IsBoolean()
  includePrice?: boolean;

  @IsOptional()
  @IsBoolean()
  includeAvailability?: boolean;

  @IsOptional()
  @IsBoolean()
  includeName?: boolean;

  @IsOptional()
  @IsBoolean()
  includeMetadata?: boolean;
}

export class PropertySearchRequestDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => PropertyFilterDto)
  filter?: PropertyFilterDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PropertySortDto)
  sort?: PropertySortDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PropertyPaginationDto)
  pagination?: PropertyPaginationDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PropertyFieldsDto)
  fields?: PropertyFieldsDto;
}
