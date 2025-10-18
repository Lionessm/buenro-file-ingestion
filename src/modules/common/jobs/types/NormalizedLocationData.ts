import { PriceSegment } from "../../properties/types/propertySearchFilter.type";

export type NormalizedLocationData = {
    id: string | null;
    name: string | null;
    location: {
      country: string | null;
      city: string | null;
    };
    isAvailable: boolean | null;
    priceForNight: number | null;
    priceSegment: PriceSegment | unknown;
    originalData: any;
}
