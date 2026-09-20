export interface Beverage {
  id: string,
  name: string,
  type: string,
  temperature: string,
  beverageContentIds: string[],
  recipeId: string | null
}

export interface CreateBeverageRequest {
  name: string,
  type: string,
  temperature: string
}

export interface Ingredient {
  id: string,
  name: string,
  unitType: string,
  unitCount: number
}

export interface Instruction {
  id: string,
  step: number,
  instruction: string
}

export interface Recipe {
  id: string,
  beverageId: string | null,
  ingredients: Ingredient[],
  instructions: Instruction[]
}