export interface PageParams {
  page?: number;
  size?: number;
  sort?: string | string[];
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  isEmpty: boolean;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPageParams: PageParams | null;
  previousPageParams: PageParams | null;
}

export const toPagedResult = <T>(
  response: PageResponse<T>,
  params: PageParams = {},
): PagedResult<T> => {
  const adjacentParams = (page: number): PageParams => ({
    page,
    size: response.size,
    ...(params.sort === undefined ? {} : { sort: params.sort }),
  });

  return {
    items: response.content,
    page: response.page,
    size: response.size,
    totalItems: response.totalElements,
    totalPages: response.totalPages,
    isEmpty: response.content.length === 0,
    hasNextPage: !response.last,
    hasPreviousPage: !response.first,
    nextPageParams: response.last ? null : adjacentParams(response.page + 1),
    previousPageParams: response.first ? null : adjacentParams(response.page - 1),
  };
};

export const fetchAllPages = async <T>(
  fetchPage: (params: PageParams) => Promise<PagedResult<T>>,
  params: PageParams = {},
): Promise<T[]> => {
  const items: T[] = [];
  let nextParams: PageParams | null = params;

  while (nextParams !== null) {
    const result: PagedResult<T> = await fetchPage(nextParams);
    items.push(...result.items);
    nextParams = result.nextPageParams;
  }

  return items;
};
