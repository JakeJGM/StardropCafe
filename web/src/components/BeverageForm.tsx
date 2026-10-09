import { useEffect, useState, type FormEvent } from 'react'
import {
  createBeverage,
  getBeverageContents,
  getBeverageOptions,
  updateBeverage,
  type Beverage,
  type BeverageContent,
  type BeverageOptions,
} from '../api'
import { ContentPicker, type SelectedContent } from './ContentPicker'

type Props = {
  /** When given, the form edits this beverage instead of creating a new one. */
  initial?: Beverage
  onSaved: (beverage: Beverage) => void
  onCancel?: () => void
}

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

export function BeverageForm({ initial, onSaved, onCancel }: Props) {
  const [options, setOptions] = useState<BeverageOptions | null>(null)
  const [availableContents, setAvailableContents] = useState<BeverageContent[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)

  const [name, setName] = useState(initial?.name ?? '')
  const [type, setType] = useState(initial?.type ?? '')
  const [temperature, setTemperature] = useState(initial?.temperature ?? '')
  const [contents, setContents] = useState<SelectedContent[]>(() =>
    (initial?.beverageContents ?? []).map(({ id, name }) => ({ id, name })),
  )

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getBeverageOptions(), getBeverageContents()])
      .then(([loadedOptions, loadedContents]) => {
        setOptions(loadedOptions)
        setAvailableContents(loadedContents)
      })
      .catch((e: Error) => setLoadError(e.message))
  }, [])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (contents.length === 0) {
      setError('Pick at least one content.')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const body = {
        name: name.trim(),
        type,
        temperature,
        beverageContentIds: contents.flatMap((c) => (c.id === null ? [] : [c.id])),
        newBeverageContentNames: contents.flatMap((c) => (c.id === null ? [c.name] : [])),
      }
      const beverage = initial ? await updateBeverage(initial.id, body) : await createBeverage(body)
      onSaved(beverage)
    } catch (e) {
      setError((e as Error).message)
      setSubmitting(false)
    }
  }

  if (loadError) {
    return <p className="alert error">{loadError}</p>
  }
  if (!options) {
    return <p className="muted">Loading…</p>
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>{initial ? 'Edit beverage' : 'New beverage'}</h2>

      <label className="field">
        <span>Name</span>
        <input
          type="text"
          required
          placeholder="e.g. Stardrop Latte"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </label>

      <div className="field-row">
        <label className="field">
          <span>Type</span>
          <select required value={type} onChange={(event) => setType(event.target.value)}>
            <option value="" disabled>
              Select type…
            </option>
            {options.types.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Temperature</span>
          <select required value={temperature} onChange={(event) => setTemperature(event.target.value)}>
            <option value="" disabled>
              Select temperature…
            </option>
            {options.temperatures.map((option) => (
              <option key={option} value={option}>
                {capitalize(option)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ContentPicker
        available={availableContents}
        selected={contents}
        onChange={(next) => {
          setContents(next)
          setError(null)
        }}
      />

      {error && <p className="alert error">{error}</p>}

      <div className="actions">
        {onCancel && (
          <button type="button" className="secondary" disabled={submitting} onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : initial ? 'Save changes' : 'Create beverage'}
        </button>
      </div>
    </form>
  )
}
