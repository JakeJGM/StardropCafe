import { BeverageDetail } from './components/BeverageDetail'
import { BeverageList } from './components/BeverageList'
import { CreatePage } from './components/CreatePage'
import { hrefs, useRoute } from './routes'
import './App.css'

function App() {
  const route = useRoute()

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1>Stardrop Cafe</h1>
          <p className="muted">Menu editor</p>
        </div>
        <nav className="tabs" aria-label="Main">
          <a href={hrefs.create} aria-current={route.name === 'create' ? 'page' : undefined}>
            Create
          </a>
          <a href={hrefs.beverages} aria-current={route.name !== 'create' ? 'page' : undefined}>
            Beverages
          </a>
        </nav>
      </header>

      {route.name === 'create' && <CreatePage />}
      {route.name === 'beverages' && <BeverageList />}
      {/* Keyed by id so moving between beverages starts from a fresh load. */}
      {route.name === 'beverage' && <BeverageDetail key={route.id} id={route.id} />}
    </div>
  )
}

export default App
