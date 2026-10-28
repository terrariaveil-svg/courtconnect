
import { useState } from "react";
import App from "./App";
import Login from "./components/Login";

export default function LoginGate() {
  const [loggedIn, setLoggedIn] = useState(false);

  if (!loggedIn) {
    return <Login onLogin={() => setLoggedIn(true)} />;
  }

  return <App />;
}
