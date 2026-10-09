import type { Beverage, Recipe } from '../api'

export function BeverageMeta({ beverage }: { beverage: Beverage }) {
  return (
    <p className="muted meta">
      {beverage.type} · {beverage.temperature} ·{' '}
      {beverage.beverageContents.map((content) => content.name).join(', ')}
    </p>
  )
}

export function RecipeDetails({ recipe }: { recipe: Recipe }) {
  return (
    <>
      <h3>Ingredients</h3>
      <ul>
        {recipe.ingredients.map((ingredient) => (
          <li key={ingredient.id}>
            {ingredient.unitCount} {ingredient.unitType} of {ingredient.name}
          </li>
        ))}
      </ul>
      {recipe.instructions.length > 0 && (
        <>
          <h3>Instructions</h3>
          <ol>
            {recipe.instructions.map((instruction) => (
              <li key={instruction.id}>{instruction.instruction}</li>
            ))}
          </ol>
        </>
      )}
    </>
  )
}
