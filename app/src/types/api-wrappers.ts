export interface ApiResponse<T> {
  data: T,
  status: number,
  message?: string,
}

export interface PaginatedApiResponse<T> {
  data: T[];
  status: number,
  message?: string,
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}