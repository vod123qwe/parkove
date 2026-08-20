/**
 * The app is served from a subfolder on GitHub Pages, so a path starting with
 * a slash points outside it. Every file we ship (photos, stamps) has to be
 * asked for relative to the base the build was made with.
 */
export const asset = (path: string) =>
  path.startsWith('http') ? path : `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
