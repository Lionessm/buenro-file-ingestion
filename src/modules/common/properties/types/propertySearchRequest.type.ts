import { PropertyFilter } from "./propertySearchFilter.type";
import { PropertySort } from "./propertySort.type";
import { PropertyPagination } from "./propertyPagination.type";
import { PropertyFields } from "./propertyFields.type";

export type PropertySearchRequestType = {
    filter?: PropertyFilter;
    sort?: PropertySort;
    pagination?: PropertyPagination;
    fields?: PropertyFields;
}