import { Beverage } from '@/types/sc-entities';
import axios from 'axios';
import { ApiResponse, PaginatedApiResponse } from '../types/api-wrappers';

const apiClient = axios.create({
  baseURL: 'https://api.example.com',
});

// --- Call endpoints and return wrapped responses ---

const getBeverages = async (page: number = 1): Promise<PaginatedApiResponse<Beverage>> => {
  const response = await apiClient.get<PaginatedApiResponse<Beverage>>(`/beverages`, {
    params: { page },
  });
  return response.data;
};

const getBeverageById = async (id: number): Promise<ApiResponse<Beverage>> => {
  const response = await apiClient.get<ApiResponse<Beverage>>(`/beverages/${id}`);
  return response.data;
};
