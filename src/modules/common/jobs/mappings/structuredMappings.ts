export const structureMappings = {
    structureA: {
      id: (item: any) => item.id?.toString() || null,
      name: (item: any) => item.name || null,
      location: (item: any) => ({
        country: item.address?.country || null,
        city: item.address?.city || null,
      }),
      isAvailable: (item: any) =>
        item.isAvailable !== undefined ? item.isAvailable : null,
      priceForNight: (item: any) => item.priceForNight || null,
      priceSegment: (item: any, that: any) =>
        that.calculatePriceSegment(item.priceForNight),
    },
  
    structureB: {
      id: (item: any) => item.id?.toString() || null,
      name: () => null,
      location: (item: any) => ({
        country: null,
        city: item.city || null,
      }),
      isAvailable: (item: any) =>
        item.availability !== undefined ? item.availability : null,
      priceForNight: (item: any) => item.pricePerNight || null,
      priceSegment: (item: any) => item.priceSegment || null,
    }
};
  