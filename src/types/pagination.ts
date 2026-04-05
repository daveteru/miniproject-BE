export interface PaginationQueryParams {
  page: number;
  take: number;
  sortOrder: string; // asc/desc
  sortBy: string; // eg: createdAt/id/name
}