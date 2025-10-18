import { IsArray, IsBoolean, IsNumber, IsObject, IsOptional, IsString, ValidateNested, IsDateString, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class PropertyLocationDto {
  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  city?: string;
}

export class PropertyMetadataDto {
  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  batchId?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  createdAt?: Date;
}

export class PropertyDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PropertyLocationDto)
  location?: PropertyLocationDto;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  priceSegment?: string;

  @IsOptional()
  @IsBoolean()
  available?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => PropertyMetadataDto)
  metadata?: PropertyMetadataDto;
}

export class PropertyPaginationDto {
  @IsNumber()
  total: number;

  @IsNumber()
  limit: number;

  @IsNumber()
  skip: number;

  @IsBoolean()
  hasMore: boolean;
}

export class PropertySearchCriteriaDto {
  @IsOptional()
  @IsObject()
  filter?: any;

  @IsOptional()
  @IsObject()
  sort?: any;

  @IsOptional()
  @IsObject()
  fields?: any;
}

export class PropertySearchResponseDto {
  @IsBoolean()
  success: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PropertyDto)
  data: PropertyDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => PropertyPaginationDto)
  pagination?: PropertyPaginationDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PropertySearchCriteriaDto)
  searchCriteria?: PropertySearchCriteriaDto;

  @IsOptional()
  @IsString()
  error?: string;
}
