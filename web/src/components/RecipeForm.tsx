import { useState, type DragEvent, type FormEvent, type KeyboardEvent } from 'react'
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

/** Singular → plural for the suggested units. Units the user types themselves are left as written. */
const COMMON_UNITS: Record<string, string> = {
  shot: 'shots',
  cup: 'cups',
  ounce: 'ounces',
  teaspoon: 'teaspoons',
  tablespoon: 'tablespoons',
  pump: 'pumps',
  scoop: 'scoops',
  splash: 'splashes',
  dash: 'dashes',
  slice: 'slices',
}
const SINGULAR_UNITS = Object.fromEntries(Object.entries(COMMON_UNITS).map(([singular, plural]) => [plural, singular]))

const isPlural = (unitCount: string) => Number(unitCount) > 1

/** Switches a known unit to its singular or plural form to match the amount. */
function inflectUnit(unitType: string, unitCount: string): string {
  const unit = unitType.trim().toLowerCase()
  const singular = unit in COMMON_UNITS ? unit : SINGULAR_UNITS[unit]
  if (!singular) return unitType
  return isPlural(unitCount) ? COMMON_UNITS[singular] : singular
}

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
      ? initial.ingredients.map((i) => ({ key: nextKey++, unitCount: String(i.unitCount), unitType: inflectUnit(i.unitType, String(i.unitCount)), name: i.name }))
      : [emptyIngredient()],
  )
  const [instructions, setInstructions] = useState<InstructionRow[]>(() =>
    initial?.instructions.length
      ? initial.instructions.map((i) => ({ key: nextKey++, text: i.instruction }))
      : [emptyInstruction()],
  )
  // A step only becomes draggable while its handle is held, so text in the textarea stays selectable.
  const [armedKey, setArmedKey] = useState<number | null>(null)
  const [draggingKey, setDraggingKey] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateIngredient = (key: number, patch: Partial<IngredientRow>) => {
    setIngredients((rows) => rows.map((row) => (row.key === key ? { ...row, ...patch } : row)))
    setError(null)
  }

  const updateInstruction = (key: number, text: string) => {
    setInstructions((rows) => rows.map((row) => (row.key === key ? { ...row, text } : row)))
  }

  const moveInstruction = (key: number, toIndex: number) => {
    setInstructions((rows) => {
      const fromIndex = rows.findIndex((row) => row.key === key)
      if (fromIndex === -1 || fromIndex === toIndex || toIndex < 0 || toIndex >= rows.length) return rows
      const next = [...rows]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return next
    })
  }

  const handleStepDragOver = (event: DragEvent<HTMLLIElement>, index: number) => {
    if (draggingKey === null) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'

    // Only swap once the pointer passes the hovered step's midpoint, so steps of
    // different heights don't flip back and forth under the cursor.
    const fromIndex = instructions.findIndex((row) => row.key === draggingKey)
    const rect = event.currentTarget.getBoundingClientRect()
    const midpoint = rect.top + rect.height / 2
    if ((fromIndex < index && event.clientY > midpoint) || (fromIndex > index && event.clientY < midpoint)) {
      moveInstruction(draggingKey, index)
    }
  }

  const endStepDrag = () => {
    setArmedKey(null)
    setDraggingKey(null)
  }

  const handleStepHandleKeyDown = (event: KeyboardEvent<HTMLSpanElement>, key: number, index: number) => {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return
    event.preventDefault()
    moveInstruction(key, event.key === 'ArrowUp' ? index - 1 : index + 1)
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
        <datalist id="unit-suggestions-singular">
          {Object.keys(COMMON_UNITS).map((unit) => (
            <option key={unit} value={unit} />
          ))}
        </datalist>
        <datalist id="unit-suggestions-plural">
          {Object.values(COMMON_UNITS).map((unit) => (
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
                onChange={(event) =>
                  updateIngredient(row.key, {
                    unitCount: event.target.value,
                    unitType: inflectUnit(row.unitType, event.target.value),
                  })
                }
              />
              <input
                className="unit"
                type="text"
                list={isPlural(row.unitCount) ? 'unit-suggestions-plural' : 'unit-suggestions-singular'}
                placeholder={isPlural(row.unitCount) ? 'shots' : 'shot'}
                aria-label={`Ingredient ${index + 1} unit`}
                value={row.unitType}
                onChange={(event) => updateIngredient(row.key, { unitType: event.target.value })}
                onBlur={() => {
                  const unitType = inflectUnit(row.unitType, row.unitCount)
                  if (unitType !== row.unitType) updateIngredient(row.key, { unitType })
                }}
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
          Instructions <span className="muted">- optional</span>
        </legend>
        <ol className="rows">
          {instructions.map((row, index) => (
            <li
              key={row.key}
              className={row.key === draggingKey ? 'instruction-row dragging' : 'instruction-row'}
              draggable={row.key === armedKey}
              onDragStart={(event) => {
                event.dataTransfer.effectAllowed = 'move'
                event.dataTransfer.setData('text/plain', row.text)
                setDraggingKey(row.key)
              }}
              onDragOver={(event) => handleStepDragOver(event, index)}
              onDrop={(event) => event.preventDefault()}
              onDragEnd={endStepDrag}
            >
              <span
                className="drag-handle"
                role="button"
                tabIndex={instructions.length > 1 ? 0 : -1}
                aria-label={`Reorder step ${index + 1}. Drag, or use the up and down arrow keys.`}
                aria-disabled={instructions.length === 1}
                title="Drag to reorder"
                onPointerDown={() => setArmedKey(row.key)}
                onPointerUp={() => setArmedKey(null)}
                onKeyDown={(event) => handleStepHandleKeyDown(event, row.key, index)}
              >
                ⠿
              </span>
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
