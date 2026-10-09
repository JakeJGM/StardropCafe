// Defaults to the Spring Boot dev server; set VITE_API_URL in web/.env to override.
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

export type BeverageOptions = {
  types: string[]
  temperatures: string[]
}

export type BeverageContent = {
  id: string
  name: string
}

export type Beverage = {
  id: string
  name: string
  type: string
  temperature: string
  beverageContents: BeverageContent[]
  recipeId: string | null
}

export type BeverageRequest = {
  name: string
  type: string
  temperature: string
  beverageContentIds: string[]
  newBeverageContentNames: string[]
}

export type IngredientRequest = {
  unitCount: number
  unitType: string
  name: string
}

export type RecipeRequest = {
  ingredients: IngredientRequest[]
  instructions: string[]
}

export type Page<T> = {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

export type Recipe = {
  id: string
  beverageId: string
  ingredients: (IngredientRequest & { id: string })[]
  instructions: { id: string; step: number; instruction: string }[]
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    })
  } catch {
    throw new Error(`Could not reach the server at ${API_URL}. Is the backend running?`)
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.message ?? `Request failed (${response.status})`)
  }
  if (response.status === 204) {
    return undefined as T
  }
  return response.json() as Promise<T>
}

export const getBeverageOptions = () => request<BeverageOptions>('/beverages/options')

export const getBeverageContents = () => request<BeverageContent[]>('/beverage-contents')

export const getBeverages = (page: number, size = 25) =>
  request<Page<Beverage>>(`/beverages?page=${page}&size=${size}&sort=name,asc`)

export const getBeverage = (id: string) => request<Beverage>(`/beverages/${id}`)

export const createBeverage = (body: BeverageRequest) =>
  request<Beverage>('/beverages', { method: 'POST', body: JSON.stringify(body) })

export const updateBeverage = (id: string, body: BeverageRequest) =>
  request<Beverage>(`/beverages/${id}`, { method: 'PUT', body: JSON.stringify(body) })

/** Also deletes the beverage's recipe. */
export const deleteBeverage = (id: string) => request<void>(`/beverages/${id}`, { method: 'DELETE' })

export const getRecipe = (id: string) => request<Recipe>(`/recipes/${id}`)

export const createRecipe = (beverageId: string, body: RecipeRequest) =>
  request<Recipe>(`/recipes/beverage/${beverageId}`, { method: 'POST', body: JSON.stringify(body) })

export const updateRecipe = (id: string, body: RecipeRequest) =>
  request<Recipe>(`/recipes/${id}`, { method: 'PUT', body: JSON.stringify(body) })

export const deleteRecipe = (id: string) => request<void>(`/recipes/${id}`, { method: 'DELETE' })
