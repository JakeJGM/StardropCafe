import { useState } from 'react'
import type { Beverage, Recipe } from './api'
import { BeverageForm } from './components/BeverageForm'
import { RecipeForm } from './components/RecipeForm'
import './App.css'

type Step =
  | { name: 'beverage' }
  | { name: 'recipe'; beverage: Beverage }
  | { name: 'done'; beverage: Beverage; recipe: Recipe | null }

const STEP_LABELS = ['Beverage', 'Recipe', 'Done']
const STEP_INDEX: Record<Step['name'], number> = { beverage: 0, recipe: 1, done: 2 }

function App() {
  const [step, setStep] = useState<Step>({ name: 'beverage' })
  // Remounting the beverage form on "create another" resets its fields and reloads contents.
  const [formKey, setFormKey] = useState(0)

  const startOver = () => {
    setFormKey((key) => key + 1)
    setStep({ name: 'beverage' })
  }

  return (
    <div className="page">
      <header className="header">
        <h1>Stardrop Cafe</h1>
        <p className="muted">Menu editor</p>
      </header>

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
        <BeverageForm key={formKey} onCreated={(beverage) => setStep({ name: 'recipe', beverage })} />
      )}

      {step.name === 'recipe' && (
        <>
          <p className="alert success">
            <strong>{step.beverage.name}</strong> was created. Add a recipe now, or skip it.
          </p>
          <RecipeForm
            beverage={step.beverage}
            onCreated={(recipe) => setStep({ name: 'done', beverage: step.beverage, recipe })}
            onSkip={() => setStep({ name: 'done', beverage: step.beverage, recipe: null })}
          />
        </>
      )}

      {step.name === 'done' && (
        <section className="card">
          <h2>{step.beverage.name}</h2>
          <p className="muted">
            {step.beverage.type} · {step.beverage.temperature} ·{' '}
            {step.beverage.beverageContents.map((content) => content.name).join(', ')}
          </p>

          {step.recipe ? (
            <>
              <h3>Ingredients</h3>
              <ul>
                {step.recipe.ingredients.map((ingredient) => (
                  <li key={ingredient.id}>
                    {ingredient.unitCount} {ingredient.unitType} of {ingredient.name}
                  </li>
                ))}
              </ul>
              {step.recipe.instructions.length > 0 && (
                <>
                  <h3>Instructions</h3>
                  <ol>
                    {step.recipe.instructions.map((instruction) => (
                      <li key={instruction.id}>{instruction.instruction}</li>
                    ))}
                  </ol>
                </>
              )}
            </>
          ) : (
            <p>No recipe added.</p>
          )}

          <div className="actions">
            <button type="button" onClick={startOver}>
              Create another beverage
            </button>
          </div>
        </section>
      )}
    </div>
  )
}

export default App
