import { Beverage, CreateBeverageRequest, Recipe } from '@/types/sc-entities';
import axios from 'axios';
import { ApiResponse, PaginatedApiResponse } from '../types/api-wrappers';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080',
});

// --- Call endpoints and return wrapped responses ---

export const getBeverages = async (page: number = 1): Promise<PaginatedApiResponse<Beverage>> => {
  const response = await apiClient.get<PaginatedApiResponse<Beverage>>(`/beverages`, {
    params: { page },
  });
  return response.data;
};

export const getBeverageById = async (id: number): Promise<ApiResponse<Beverage>> => {
  const response = await apiClient.get<ApiResponse<Beverage>>(`/beverages/${id}`);
  return response.data;
};

// --- Call endpoints and return the backend's raw response shape ---

export const createBeverage = async (request: CreateBeverageRequest): Promise<Beverage> => {
  const response = await apiClient.post<Beverage>(`/beverages`, request);
  return response.data;
};

export const getRecipes = async (): Promise<Recipe[]> => {
  const response = await apiClient.get<Recipe[]>(`/recipes`);
  return response.data;
};

export const getRecipeById = async (id: string): Promise<Recipe> => {
  const response = await apiClient.get<Recipe>(`/recipes/${id}`);
  return response.data;
};

export const getRecipeByBeverageId = async (beverageId: string): Promise<Recipe> => {
  const response = await apiClient.get<Recipe>(`/recipes/beverage/${beverageId}`);
  return response.data;
};
