import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from './reducers'
import ConvertScreen from './screens/ConvertScreen'
import VideoSelectScreen from './screens/VideoSelectScreen'

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/convert" element={<ConvertScreen />} />
            <Route path="/" element={<VideoSelectScreen />} />
          </Routes>
        </div>
      </Router>
    </Provider>
  )
}

export default App
