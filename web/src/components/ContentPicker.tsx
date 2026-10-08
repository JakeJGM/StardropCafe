import { useState } from 'react'
import type { BeverageContent } from '../api'

const MAX_CONTENTS = 3

/** A content chosen from the existing list, or a new one to be created with the beverage. */
export type SelectedContent = { id: string; name: string } | { id: null; name: string }

type Props = {
  available: BeverageContent[]
  selected: SelectedContent[]
  onChange: (selected: SelectedContent[]) => void
}

const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase()

export function ContentPicker({ available, selected, onChange }: Props) {
  const [newName, setNewName] = useState('')
  const [hint, setHint] = useState<string | null>(null)

  const isFull = selected.length >= MAX_CONTENTS
  const unselected = available.filter((content) => !selected.some((s) => s.id === content.id))

  const add = (content: SelectedContent) => {
    if (isFull) return
    onChange([...selected, content])
  }

  const addNew = () => {
    const name = newName.trim()
    if (!name) return

    if (selected.some((s) => sameName(s.name, name))) {
      setHint(`"${name}" is already selected.`)
      return
    }
    // Typing the name of an existing content selects it instead of creating a duplicate.
    const existing = available.find((content) => sameName(content.name, name))
    add(existing ?? { id: null, name })
    setHint(existing ? `"${existing.name}" already exists, so it was selected.` : null)
    setNewName('')
  }

  const remove = (index: number) => {
    onChange(selected.filter((_, i) => i !== index))
    setHint(null)
  }

  return (
    <fieldset className="field">
      <legend>
        Contents <span className="muted">— pick 1 to {MAX_CONTENTS} that best describe the drink</span>
      </legend>

      {selected.length > 0 && (
        <ul className="chips">
          {selected.map((content, index) => (
            <li key={content.id ?? `new-${content.name}`} className="chip">
              {content.name}
              {content.id === null && <span className="chip-tag">new</span>}
              <button
                type="button"
                className="chip-remove"
                aria-label={`Remove ${content.name}`}
                onClick={() => remove(index)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="content-inputs">
        <select
          aria-label="Choose an existing content"
          value=""
          disabled={isFull || unselected.length === 0}
          onChange={(event) => {
            const content = unselected.find((c) => c.id === event.target.value)
            if (content) add(content)
            setHint(null)
          }}
        >
          <option value="" disabled>
            {unselected.length === 0 ? 'No existing contents left' : 'Choose existing…'}
          </option>
          {unselected.map((content) => (
            <option key={content.id} value={content.id}>
              {content.name}
            </option>
          ))}
        </select>

        <span className="muted">or</span>

        <div className="inline-add">
          <input
            type="text"
            placeholder="Create new content"
            aria-label="New content name"
            value={newName}
            disabled={isFull}
            onChange={(event) => setNewName(event.target.value)}
            onKeyDown={(event) => {
              // Enter would otherwise submit the whole beverage form.
              if (event.key === 'Enter') {
                event.preventDefault()
                addNew()
              }
            }}
          />
          <button type="button" className="secondary" disabled={isFull || !newName.trim()} onClick={addNew}>
            Add
          </button>
        </div>
      </div>

      <p className="help">
        {hint ?? (isFull ? `Maximum of ${MAX_CONTENTS} reached.` : `${selected.length} of ${MAX_CONTENTS} selected`)}
      </p>
    </fieldset>
  )
}
