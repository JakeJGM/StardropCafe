import { useEffect, useState } from 'react'
import { getBeverages, type Beverage } from '../api'
import { hrefs } from '../routes'

export function BeverageList() {
  const [beverages, setBeverages] = useState<Beverage[]>([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

      {beverages.length === 0 ? (
        <p className="muted">No beverages yet.</p>
      ) : (
        <ul className="beverage-list">
          {beverages.map((beverage) => (
            <li key={beverage.id}>
              <a href={hrefs.beverage(beverage.id)}>
                <span className="beverage-list-name">{beverage.name}</span>
                <span className="muted">
                  {beverage.type} · {beverage.temperature}
                </span>
                <span className={beverage.recipeId ? 'badge' : 'badge empty'}>
                  {beverage.recipeId ? 'Recipe' : 'No recipe'}
                </span>
              </a>
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
