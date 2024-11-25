import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import MangaPage from './pages/MangaPage'


function App() {
	return (
		<>
			<Routes>
				<Route path='/' element={<HomePage />} />
				<Route path='/mangas/:id'>
					<Route index element={<MangaPage />} />
				</Route>
			</Routes>
		</>
	)
}

export default App
