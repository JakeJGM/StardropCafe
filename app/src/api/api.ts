import { Beverage, CreateBeverageRequest, Recipe } from '@/types/sc-entities';
import {
  PageParams,
  PageResponse,
  PagedResult,
  toPagedResult,
} from '@/types/api-wrappers';
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080',
  // Spring expects repeated keys (`sort=a&sort=b`), not axios' default `sort[]=a`.
  paramsSerializer: { indexes: null },
});

export const getBeverages = async (params: PageParams = {}): Promise<PagedResult<Beverage>> => {
  const response = await apiClient.get<PageResponse<Beverage>>(`/beverages`, { params });
  return toPagedResult(response.data, params);
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
