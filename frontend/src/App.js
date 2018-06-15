import React, { Component } from 'react';
import './App.css';
import ConfigEditor from "./ConfigEditor";

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">Configuration</header>
          <ConfigEditor/>
      </div>
    );
  }
}

export default App;
