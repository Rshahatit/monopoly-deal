import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Home } from "./pages/Home"
import { Game } from "./pages/Game"
import { Lobby } from "./pages/Lobby"
import { useAuthenticator } from "@aws-amplify/ui-react"
function App() {
  const { signOut } = useAuthenticator()
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-purple-700 to-blue-900">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/game" element={<Game />} />

          <button onClick={signOut}>Sign out</button>
        </Routes>
      </div>
    </Router>
  )
}

export default App
