const NAME_KEY = 'pk-name'

export const getName = () => localStorage.getItem(NAME_KEY) ?? ''
export const setName = (name: string) => localStorage.setItem(NAME_KEY, name.trim())

/** greeting that works before the name is known */
export const greeting = (name: string) => (name ? `Hej ${name}` : 'Hej')

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('') || '?'
