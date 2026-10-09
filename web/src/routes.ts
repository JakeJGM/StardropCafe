import { useSyncExternalStore } from 'react'

export type Route = { name: 'create' } | { name: 'beverages' } | { name: 'beverage'; id: string }

// Hash-based so a refresh keeps the current page without any server routing.
export const hrefs = {
  create: '#/',
  beverages: '#/beverages',
  beverage: (id: string) => `#/beverages/${id}`,
}

function parseRoute(hash: string): Route {
  const [, section, id] = hash.replace(/^#/, '').split('/')
  if (section === 'beverages') {
    return id ? { name: 'beverage', id } : { name: 'beverages' }
  }
  return { name: 'create' }
}

const subscribe = (onChange: () => void) => {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

export function useRoute(): Route {
  // Subscribe to the hash string (a stable snapshot), then parse it.
  return parseRoute(useSyncExternalStore(subscribe, () => window.location.hash))
}

export function navigate(href: string) {
  window.location.hash = href
}
