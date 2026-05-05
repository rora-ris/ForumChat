import React from "react";
import "./App.css";
import Chat from "./Chat";

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="app-title">
          <h1>Forum Chat</h1>
        </div>
      </header>
      <main className="app-main">
        <Chat />
      </main>
    </div>
  );
}

export default App;