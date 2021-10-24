import logo from "./logo.svg";
import "./App.css";
import React, { useState } from "react";
import Chat from "./Chat/Chat";
import Login from "./Login/Login";

const App = () => {
  const [credentials, setCredentials] = useState({ server: "localhost:4000" });
  const [chatEnabled, setChatEnabled] = useState(false);

  const handleTextFieldOnChange = (e) => {
    e.preventDefault();
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLoginOnSubmit = (e) => {
    e.preventDefault();
    const server = `http://${credentials.server}`;
    setCredentials({ ...credentials, server });
    setChatEnabled(true);
  };
  return (
    <div className="App">
      {chatEnabled ? (
        <Chat server={credentials.server} />
      ) : (
        <Login
          handleLoginOnSubmit={handleLoginOnSubmit}
          handleTextFieldOnChange={handleTextFieldOnChange}
          server={credentials.server}
        />
      )}
    </div>
  );
};

export default App;
