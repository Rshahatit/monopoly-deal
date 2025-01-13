import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./styles/global.css"
import { Amplify } from "aws-amplify"
import awsExports from "../amplify_outputs.json"
import { GameProvider } from "./context/GameContext"
import { Authenticator } from "@aws-amplify/ui-react"
import "@aws-amplify/ui-react/styles.css"

Amplify.configure(awsExports)

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Authenticator>
      <GameProvider>
        <App />
      </GameProvider>
    </Authenticator>
  </React.StrictMode>
)
