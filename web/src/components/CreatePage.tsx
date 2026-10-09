import { useState } from 'react'
import type { Beverage, Recipe } from '../api'
import { hrefs } from '../routes'
import { BeverageForm } from './BeverageForm'
import { BeverageMeta, RecipeDetails } from './RecipeDetails'
import { RecipeForm } from './RecipeForm'

type Step =
  | { name: 'beverage' }
  | { name: 'recipe'; beverage: Beverage }
  | { name: 'done'; beverage: Beverage; recipe: Recipe | null }

const STEP_LABELS = ['Beverage', 'Recipe', 'Done']
const STEP_INDEX: Record<Step['name'], number> = { beverage: 0, recipe: 1, done: 2 }

export function CreatePage() {
  const [step, setStep] = useState<Step>({ name: 'beverage' })
  // Remounting the beverage form on "create another" resets its fields and reloads contents.
  const [formKey, setFormKey] = useState(0)

  const startOver = () => {
    setFormKey((key) => key + 1)
    setStep({ name: 'beverage' })
  }

  return (
    <>
      <ol className="stepper" aria-label="Progress">
        {STEP_LABELS.map((label, index) => (
          <li
            key={label}
            className={index === STEP_INDEX[step.name] ? 'current' : index < STEP_INDEX[step.name] ? 'complete' : ''}
            aria-current={index === STEP_INDEX[step.name] ? 'step' : undefined}
          >
            {label}
          </li>
        ))}
      </ol>

      {step.name === 'beverage' && (
        <BeverageForm key={formKey} onSaved={(beverage) => setStep({ name: 'recipe', beverage })} />
      )}

      {step.name === 'recipe' && (
        <>
          <p className="alert success">
            <strong>{step.beverage.name}</strong> was created. Add a recipe now, or skip it.
          </p>
          <RecipeForm
            beverage={step.beverage}
            cancelLabel="Skip recipe"
            onSaved={(recipe) => setStep({ name: 'done', beverage: step.beverage, recipe })}
            onCancel={() => setStep({ name: 'done', beverage: step.beverage, recipe: null })}
          />
        </>
      )}

      {step.name === 'done' && (
        <section className="card">
          <div>
            <h2>{step.beverage.name}</h2>
            <BeverageMeta beverage={step.beverage} />
          </div>

          {step.recipe ? <RecipeDetails recipe={step.recipe} /> : <p>No recipe added.</p>}

          <div className="actions">
            <a className="button secondary" href={hrefs.beverage(step.beverage.id)}>
              View beverage
            </a>
            <button type="button" onClick={startOver}>
              Create another beverage
            </button>
          </div>
        </section>
      )}
    </>
  )
}
