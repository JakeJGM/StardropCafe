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

export type CreateBeverageRequest = {
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

export type CreateRecipeRequest = {
  ingredients: IngredientRequest[]
  instructions: string[]
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
  return response.json() as Promise<T>
}

export const getBeverageOptions = () => request<BeverageOptions>('/beverages/options')

export const getBeverageContents = () => request<BeverageContent[]>('/beverage-contents')

export const createBeverage = (body: CreateBeverageRequest) =>
  request<Beverage>('/beverages', { method: 'POST', body: JSON.stringify(body) })

export const createRecipe = (beverageId: string, body: CreateRecipeRequest) =>
  request<Recipe>(`/recipes/beverage/${beverageId}`, { method: 'POST', body: JSON.stringify(body) })
