// Paginated API response wrapper
export interface ApiResponse<T> {
  data: T,
  message: string,
  status: number
}

// --- StardropCafe Entities ---
export interface Beverage {
  id: string,
  type: string,
  name: string,
  temperature: string,
  contents: string[]
}

export interface Recipe {}