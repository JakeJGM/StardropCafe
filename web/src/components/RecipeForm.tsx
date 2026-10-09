import { useState, type FormEvent } from 'react'
import { createRecipe, updateRecipe, type Beverage, type IngredientRequest, type Recipe } from '../api'

type Props = {
  beverage: Beverage
  /** When given, the form edits this recipe instead of creating one for the beverage. */
  initial?: Recipe
  onSaved: (recipe: Recipe) => void
  onCancel: () => void
  cancelLabel?: string
}

type IngredientRow = { key: number; unitCount: string; unitType: string; name: string }
type InstructionRow = { key: number; text: string }

const COMMON_UNITS = ['shot', 'cup', 'ounce', 'teaspoon', 'tablespoon', 'pump', 'scoop', 'splash', 'dash', 'slice']

let nextKey = 0
const emptyIngredient = (): IngredientRow => ({ key: nextKey++, unitCount: '', unitType: '', name: '' })
const emptyInstruction = (): InstructionRow => ({ key: nextKey++, text: '' })

const isBlank = (row: IngredientRow) => !row.unitCount.trim() && !row.unitType.trim() && !row.name.trim()

/** Fully blank rows are ignored; partially filled ones are an error the user must fix. */
function toIngredientRequests(rows: IngredientRow[]): IngredientRequest[] | string {
  const filled = rows.filter((row) => !isBlank(row))
  if (filled.length === 0) return 'Add at least one ingredient.'

  for (const row of filled) {
    const count = Number(row.unitCount)
    if (!row.unitCount.trim() || !Number.isFinite(count) || count <= 0) {
      return 'Each ingredient needs an amount greater than 0.'
    }
    if (!row.unitType.trim()) return 'Each ingredient needs a unit (e.g. shot, cup).'
    if (!row.name.trim()) return 'Each ingredient needs a name.'
  }
  return filled.map((row) => ({
    unitCount: Number(row.unitCount),
    unitType: row.unitType.trim(),
    name: row.name.trim(),
  }))
}

export function RecipeForm({ beverage, initial, onSaved, onCancel, cancelLabel = 'Cancel' }: Props) {
  const [ingredients, setIngredients] = useState<IngredientRow[]>(() =>
    initial?.ingredients.length
      ? initial.ingredients.map((i) => ({ key: nextKey++, unitCount: String(i.unitCount), unitType: i.unitType, name: i.name }))
      : [emptyIngredient()],
  )
  const [instructions, setInstructions] = useState<InstructionRow[]>(() =>
    initial?.instructions.length
      ? initial.instructions.map((i) => ({ key: nextKey++, text: i.instruction }))
      : [emptyInstruction()],
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateIngredient = (key: number, patch: Partial<IngredientRow>) => {
    setIngredients((rows) => rows.map((row) => (row.key === key ? { ...row, ...patch } : row)))
    setError(null)
  }

  const updateInstruction = (key: number, text: string) => {
    setInstructions((rows) => rows.map((row) => (row.key === key ? { ...row, text } : row)))
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const ingredientRequests = toIngredientRequests(ingredients)
    if (typeof ingredientRequests === 'string') {
      setError(ingredientRequests)
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const body = {
        ingredients: ingredientRequests,
        instructions: instructions.map((row) => row.text.trim()).filter(Boolean),
      }
      const recipe = initial ? await updateRecipe(initial.id, body) : await createRecipe(beverage.id, body)
      onSaved(recipe)
    } catch (e) {
      setError((e as Error).message)
      setSubmitting(false)
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>
        {initial ? 'Edit recipe' : 'Recipe'} for {beverage.name}
      </h2>

      <fieldset className="field">
        <legend>Ingredients</legend>
        <datalist id="unit-suggestions">
          {COMMON_UNITS.map((unit) => (
            <option key={unit} value={unit} />
          ))}
        </datalist>

        <ol className="rows">
          {ingredients.map((row, index) => (
            <li key={row.key} className="ingredient-row">
              <input
                className="amount"
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                placeholder="2"
                aria-label={`Ingredient ${index + 1} amount`}
                value={row.unitCount}
                onChange={(event) => updateIngredient(row.key, { unitCount: event.target.value })}
              />
              <input
                className="unit"
                type="text"
                list="unit-suggestions"
                placeholder="shot"
                aria-label={`Ingredient ${index + 1} unit`}
                value={row.unitType}
                onChange={(event) => updateIngredient(row.key, { unitType: event.target.value })}
              />
              <span className="of">of</span>
              <input
                className="ingredient-name"
                type="text"
                placeholder="espresso"
                aria-label={`Ingredient ${index + 1} name`}
                value={row.name}
                onChange={(event) => updateIngredient(row.key, { name: event.target.value })}
              />
              <button
                type="button"
                className="icon-button"
                aria-label={`Remove ingredient ${index + 1}`}
                disabled={ingredients.length === 1}
                onClick={() => setIngredients((rows) => rows.filter((r) => r.key !== row.key))}
              >
                ×
              </button>
            </li>
          ))}
        </ol>
        <button type="button" className="link-button" onClick={() => setIngredients((rows) => [...rows, emptyIngredient()])}>
          + Add ingredient
        </button>
      </fieldset>

      <fieldset className="field">
        <legend>
          Instructions <span className="muted">— optional</span>
        </legend>
        <ol className="rows">
          {instructions.map((row, index) => (
            <li key={row.key} className="instruction-row">
              <span className="step">{index + 1}</span>
              <textarea
                rows={2}
                placeholder={index === 0 ? 'e.g. Pull two espresso shots.' : ''}
                aria-label={`Step ${index + 1}`}
                value={row.text}
                onChange={(event) => updateInstruction(row.key, event.target.value)}
              />
              <button
                type="button"
                className="icon-button"
                aria-label={`Remove step ${index + 1}`}
                disabled={instructions.length === 1}
                onClick={() => setInstructions((rows) => rows.filter((r) => r.key !== row.key))}
              >
                ×
              </button>
            </li>
          ))}
        </ol>
        <button type="button" className="link-button" onClick={() => setInstructions((rows) => [...rows, emptyInstruction()])}>
          + Add step
        </button>
      </fieldset>

      {error && <p className="alert error">{error}</p>}

      <div className="actions">
        <button type="button" className="secondary" disabled={submitting} onClick={onCancel}>
          {cancelLabel}
        </button>
        <button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : 'Save recipe'}
        </button>
      </div>
    </form>
  )
}
