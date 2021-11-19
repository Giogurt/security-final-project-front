import "./App.css";
import React, { Component } from "react";
import Chat from "./Chat/Chat";
import Login from "./Login/Login";
import { io } from "socket.io-client";

const aValue = 17123207;
const qValue = 2426697107;
class App extends Component {
  state = {
    server: "localhost:2021",
    chatEnabled: false,
    socket: "",
    cryptoKey: "11111111",
    xValue: "",
    yValue: 0,
    startingConversation: true,
  };

  constructor(props) {
    super(props);
    this.state = {
      server: "localhost:2021",
      chatEnabled: false,
      cryptoKey: "",
      startingConversation: true,
    };
  }

  handleTextFieldOnChange = (e) => {
    e.preventDefault();
    this.setState({ [e.target.name]: e.target.value });
  };

  handleChecked = (event) => {
    this.setState({ startingConversation: event.target.checked });
  };

  handleLoginOnSubmit = (e) => {
    e.preventDefault();
    const server = `http://${this.state.server}`;
    const yValue = this.diffieHellman();
    this.setState({ server, chatEnabled: true, socket: io(server), yValue });
  };

  diffieHellman = () => {
    const x = parseInt(this.state.xValue);
    return Math.pow(aValue, x) % qValue;
  };

  handleKeyChange = (newKey) => {
    this.setState({ cryptoKey: newKey });
  }
  render() {
    return (
      <div className="App">
        {/* {console.log(this.state.cryptoKey)}
        {this.state.cryptoKey} */}
        {this.state.chatEnabled ? (
          <Chat
            socket={this.state.socket}
            cryptoKey={this.state.cryptoKey}
            yValue={this.state.yValue}
            xValue={this.state.xValue}
            startingConversation={this.state.startingConversation}
            handleKeyChange={this.handleKeyChange}
          />
        ) : (
          <Login
            handleLoginOnSubmit={this.handleLoginOnSubmit}
            handleTextFieldOnChange={this.handleTextFieldOnChange}
            server={this.state.server}
            xValue={this.state.xValue}
            startingConversation={this.state.startingConversation}
            handleChecked={this.handleChecked}
          />
        )}
      </div>
    );
  }
}

export default App;
