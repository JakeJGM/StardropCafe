/** Query parameters accepted by every paginated backend endpoint. */
export interface PageParams {
  /** Zero-based page index. Defaults to 0 on the backend. */
  page?: number;
  /** Items per page. Defaults to 20 on the backend. */
  size?: number;
  /** Sort expressions, e.g. `'name,asc'` or `['type,asc', 'name,asc']`. */
  sort?: string | string[];
}

/** The raw page envelope the backend sends over the wire. */
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

/**
 * A page of results with the derived flags callers actually reach for, so
 * screens don't recompute "is there more?" from page indexes and totals.
 */
export interface PagedResult<T> {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  isEmpty: boolean;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  /** Params for the adjacent page, sort carried over. `null` at the edges. */
  nextPageParams: PageParams | null;
  previousPageParams: PageParams | null;
}

/** Wraps a wire-level page envelope, carrying the request's sort forward. */
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

/**
 * Walks every page of an endpoint and returns the flattened results. Use for
 * small collections only — it issues one request per page.
 */
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
