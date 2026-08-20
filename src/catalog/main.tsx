import { createRoot } from 'react-dom/client'
import { Catalog, initTheme } from './Catalog'

initTheme()
createRoot(document.getElementById('root')!).render(<Catalog />)
