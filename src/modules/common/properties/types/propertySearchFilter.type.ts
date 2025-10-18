export type PropertyFilter = {
    country?: string;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    priceRange?: {
      min?: number;
      max?: number;
    };
    priceComparison?: PriceComparison;
    priceValue?: number;
    priceSegment?: 'low' | 'medium' | 'high';
    propertyName?: string;
    searchTerm?: string;
    isAvailable?: boolean;
    createdAfter?: string;
    createdBefore?: string;
    source?: string;
}

export enum PriceComparison {
    GTE = 'gte',
    LTE = 'lte',
    GT = 'gt',
    LT = 'lt',
    EQ = 'eq',
}

export enum PriceSegment {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
}