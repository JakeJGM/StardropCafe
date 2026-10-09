import { useEffect, useState } from 'react'
import { deleteBeverage, deleteRecipe, getBeverage, getRecipe, type Beverage, type Recipe } from '../api'
import { hrefs, navigate } from '../routes'
import { BeverageForm } from './BeverageForm'
import { BeverageMeta, RecipeDetails } from './RecipeDetails'
import { RecipeForm } from './RecipeForm'

type Props = {
  id: string
}

type Mode = 'view' | 'editBeverage' | 'editRecipe' | 'addRecipe'

export function BeverageDetail({ id }: Props) {
  const [beverage, setBeverage] = useState<Beverage | null>(null)
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [mode, setMode] = useState<Mode>('view')
  const [confirming, setConfirming] = useState<'beverage' | 'recipe' | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getBeverage(id)
      .then(async (loaded) => {
        setRecipe(loaded.recipeId ? await getRecipe(loaded.recipeId) : null)
        setBeverage(loaded)
      })
      .catch((e: Error) => setLoadError(e.message))
  }, [id])

  if (loadError) {
    return (
      <>
        <a className="back-link" href={hrefs.beverages}>
          ← All beverages
        </a>
        <p className="alert error">{loadError}</p>
      </>
    )
  }
  if (!beverage) {
    return <p className="muted">Loading…</p>
  }

  const runDelete = async (target: 'beverage' | 'recipe') => {
    setDeleting(true)
    setError(null)
    try {
      if (target === 'beverage') {
        await deleteBeverage(beverage.id)
        navigate(hrefs.beverages)
        return
      }
      await deleteRecipe(recipe!.id)
      setRecipe(null)
      setBeverage({ ...beverage, recipeId: null })
      setConfirming(null)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setDeleting(false)
    }
  }

  const confirmBox = (target: 'beverage' | 'recipe', message: string) => (
    <div className="confirm" role="alert">
      <p>{message}</p>
      <div className="actions">
        <button type="button" className="secondary" disabled={deleting} onClick={() => setConfirming(null)}>
          Cancel
        </button>
        <button type="button" className="danger" disabled={deleting} onClick={() => runDelete(target)}>
          {deleting ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </div>
  )

  const saveRecipe = (saved: Recipe) => {
    setRecipe(saved)
    setBeverage({ ...beverage, recipeId: saved.id })
    setMode('view')
  }

  return (
    <div className="stack">
      <a className="back-link" href={hrefs.beverages}>
        ← All beverages
      </a>

      {error && <p className="alert error">{error}</p>}

      {mode === 'editBeverage' ? (
        <BeverageForm
          initial={beverage}
          onSaved={(saved) => {
            setBeverage(saved)
            setMode('view')
          }}
          onCancel={() => setMode('view')}
        />
      ) : (
        <section className="card">
          <div className="card-header">
            <div>
              <h2>{beverage.name}</h2>
              <BeverageMeta beverage={beverage} />
            </div>
            <div className="card-header-actions">
              <button
                type="button"
                className="secondary"
                disabled={mode !== 'view'}
                onClick={() => setMode('editBeverage')}
              >
                Edit
              </button>
              <button
                type="button"
                className="danger-outline"
                disabled={mode !== 'view'}
                onClick={() => setConfirming('beverage')}
              >
                Delete
              </button>
            </div>
          </div>
          {confirming === 'beverage' &&
            confirmBox(
              'beverage',
              recipe
                ? `Delete ${beverage.name} and its recipe? This can't be undone.`
                : `Delete ${beverage.name}? This can't be undone.`,
            )}
        </section>
      )}

      {mode === 'editRecipe' || mode === 'addRecipe' ? (
        <RecipeForm
          beverage={beverage}
          initial={mode === 'editRecipe' ? recipe! : undefined}
          onSaved={saveRecipe}
          onCancel={() => setMode('view')}
        />
      ) : (
        <section className="card">
          <div className="card-header">
            <h2>Recipe</h2>
            {recipe && (
              <div className="card-header-actions">
                <button
                  type="button"
                  className="secondary"
                  disabled={mode !== 'view'}
                  onClick={() => setMode('editRecipe')}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="danger-outline"
                  disabled={mode !== 'view'}
                  onClick={() => setConfirming('recipe')}
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          {confirming === 'recipe' && confirmBox('recipe', `Delete the recipe for ${beverage.name}? The beverage stays.`)}

          {recipe ? (
            <RecipeDetails recipe={recipe} />
          ) : (
            <div className="empty-state">
              <p className="muted">This beverage doesn't have a recipe yet.</p>
              <button type="button" disabled={mode !== 'view'} onClick={() => setMode('addRecipe')}>
                Add recipe
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
