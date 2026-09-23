export interface Beverage {
  id: string,
  name: string,
  type: BeverageType,
  temperature: BeverageTemperature,
  beverageContents: BeverageContent[],
  recipeId: string | null
}

export type BeverageType = 'Coffee' | 'Tea' | 'Spirit' | 'Matcha' | 'Dirty Soda';

export type BeverageTemperature = 'hot' | 'iced' | 'cold';

export interface BeverageContent {
  id: string,
  name: string
}

export interface CreateBeverageRequest {
  name: string,
  type: BeverageType,
  temperature: BeverageTemperature
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