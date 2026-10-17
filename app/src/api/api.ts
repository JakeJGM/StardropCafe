import {
  PageParams,
  PageResponse,
  PagedResult,
  toPagedResult,
} from '@/types/api-wrappers';
import {
  Beverage,
  BeverageContent,
  BeverageFilters,
  BeverageOptions,
  CreateBeverageRequest,
  Recipe,
} from '@/types/sc-entities';
import axios from 'axios';
import Constants from 'expo-constants';

// The user enters their self-hosted API's URL on first launch; these only
// prefill that prompt during development.
// Expo only inlines env vars prefixed with EXPO_PUBLIC_ into the client bundle;
// a bare API_URL is stripped and reads as undefined at runtime.
const configuredBaseUrl = process.env.EXPO_PUBLIC_API_URL;

// The machine serving the Expo bundle usually runs the backend too. A device on
// the same network must call that host, since `localhost` is the device itself.
// hostUri is only set when the app is served by a dev server.
const devServerHost = Constants.expoConfig?.hostUri?.split(':')[0];
const inferredBaseUrl = devServerHost ? `http://${devServerHost}:8080` : undefined;

export const suggestedApiUrl = configuredBaseUrl ?? inferredBaseUrl ?? '';

const apiClient = axios.create({
  // Spring expects repeated keys (`sort=a&sort=b`), not axios' default `sort[]=a`.
  paramsSerializer: { indexes: null },
});

// Must be called with the stored URL before any request is made.
export const setApiBaseUrl = (url: string) => {
  apiClient.defaults.baseURL = url;
};

// Resolves if `url` answers like the recipe API; rejects otherwise.
export const checkApiUrl = async (url: string): Promise<void> => {
  await axios.get(`${url}/beverages/options`, { timeout: 5000 });
};

export const getBeverages = async (
  params: PageParams = {},
  filters?: BeverageFilters,
): Promise<PagedResult<Beverage>> => {
  const response = await apiClient.get<PageResponse<Beverage>>(`/beverages`, {
    params: {
      ...params,
      type: filters?.types,
      temperature: filters?.temperatures,
      contentId: filters?.contentIds,
    },
  });
  // Built from the paging params alone; callers pass the filters with every page.
  return toPagedResult(response.data, params);
};

export const getBeverageOptions = async (): Promise<BeverageOptions> => {
  const response = await apiClient.get<BeverageOptions>(`/beverages/options`);
  return response.data;
};

export const getBeverageContents = async (): Promise<BeverageContent[]> => {
  const response = await apiClient.get<BeverageContent[]>(`/beverage-contents`);
  return response.data;
};

export const getBeverageById = async (id: string): Promise<Beverage> => {
  const response = await apiClient.get<Beverage>(`/beverages/${id}`);
  return response.data;
};

export const createBeverage = async (request: CreateBeverageRequest): Promise<Beverage> => {
  const response = await apiClient.post<Beverage>(`/beverages`, request);
  return response.data;
};

export const getRecipes = async (params: PageParams = {}): Promise<PagedResult<Recipe>> => {
  const response = await apiClient.get<PageResponse<Recipe>>(`/recipes`, { params });
  return toPagedResult(response.data, params);
};

export const getRecipeById = async (id: string): Promise<Recipe> => {
  const response = await apiClient.get<Recipe>(`/recipes/${id}`);
  return response.data;
};

export const getRecipeByBeverageId = async (beverageId: string): Promise<Recipe> => {
  const response = await apiClient.get<Recipe>(`/recipes/beverage/${beverageId}`);
  return response.data;
};
