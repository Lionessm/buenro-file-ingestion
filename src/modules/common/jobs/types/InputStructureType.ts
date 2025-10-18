// Individual input structure types
export type StructureAInput = {
  id: number;
  name: string;
  address: {
    country: string;
    city: string;
  };
  isAvailable: boolean;
  priceForNight: number;
};

export type StructureBInput = {
  id: string;
  city: string;
  availability: boolean;
  priceSegment: 'high' | 'medium' | 'low';
  pricePerNight: number;
};

// Combined union type for all possible input structures
export type LocationInputData = StructureAInput | StructureBInput;

// Type guard functions to identify input structure types
export function isStructureA(data: LocationInputData): data is StructureAInput {
  return 'name' in data && 'address' in data && 'priceForNight' in data;
}

export function isStructureB(data: LocationInputData): data is StructureBInput {
  return 'city' in data && 'availability' in data && 'pricePerNight' in data && 'priceSegment' in data;
}