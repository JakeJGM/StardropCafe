import { useEffect, useState } from 'react'
import { deleteBeverage, getBeverages, type Beverage } from '../api'
import { hrefs } from '../routes'

export function BeverageList() {
  const [beverages, setBeverages] = useState<Beverage[]>([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    getBeverages(page)
      .then((result) => {
        setBeverages((current) => (page === 0 ? result.content : [...current, ...result.content]))
        setHasMore(!result.last)
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [page])

  const loadMore = () => {
    setLoading(true)
    setPage((current) => current + 1)
  }

  const runDelete = async (id: string) => {
    setDeleting(true)
    setDeleteError(null)
    try {
      await deleteBeverage(id)
      setBeverages((current) => current.filter((beverage) => beverage.id !== id))
      setConfirmingId(null)
    } catch (e) {
      setDeleteError((e as Error).message)
    } finally {
      setDeleting(false)
    }
  }

  if (error) {
    return <p className="alert error">{error}</p>
  }
  if (loading && beverages.length === 0) {
    return <p className="muted">Loading…</p>
  }

  return (
    <section className="card">
      <div className="card-header">
        <h2>Beverages</h2>
        <a className="button" href={hrefs.create}>
          + New beverage
        </a>
      </div>

      {deleteError && <p className="alert error">{deleteError}</p>}

      {beverages.length === 0 ? (
        <p className="muted">No beverages yet.</p>
      ) : (
        <ul className="beverage-list">
          {beverages.map((beverage) => (
            <li key={beverage.id}>
              <div className="beverage-list-row">
                <a href={hrefs.beverage(beverage.id)}>
                  <span className="beverage-list-name">{beverage.name}</span>
                  <span className="muted">
                    {beverage.type} · {beverage.temperature}
                  </span>
                  <span className={beverage.recipeId ? 'badge' : 'badge empty'}>
                    {beverage.recipeId ? 'Recipe' : 'No recipe'}
                  </span>
                </a>
                <button
                  type="button"
                  className="danger-outline"
                  aria-label={`Delete ${beverage.name}`}
                  disabled={deleting}
                  onClick={() => {
                    setDeleteError(null)
                    setConfirmingId(beverage.id)
                  }}
                >
                  Delete
                </button>
              </div>
              {confirmingId === beverage.id && (
                <div className="confirm" role="alert">
                  <p>
                    {beverage.recipeId
                      ? `Delete ${beverage.name} and its recipe? This can't be undone.`
                      : `Delete ${beverage.name}? This can't be undone.`}
                  </p>
                  <div className="actions">
                    <button type="button" className="secondary" disabled={deleting} onClick={() => setConfirmingId(null)}>
                      Cancel
                    </button>
                    <button type="button" className="danger" disabled={deleting} onClick={() => runDelete(beverage.id)}>
                      {deleting ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {hasMore && (
        <button type="button" className="secondary" disabled={loading} onClick={loadMore}>
          {loading ? 'Loading…' : 'Load more'}
        </button>
      )}
    </section>
  )
}
