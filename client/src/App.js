import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import styled from 'styled-components'
import Stats from './stats'
import './App.css';

const AppContainer = styled.div`
  font-family: 'RobotoDraft', 'Roboto', 'Helvetica Neue, Helvetica, Arial', sans-serif;
  font-style: normal;
  font-weight: 300;
  font-size: 1.4rem;
  line-height: 2rem;
  letter-spacing: 0.01rem;
  color: #212121;
  background-color: #f5f5f5;

  // Font Rendering
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  `

const Page = styled.div`
    margin: 20px auto;
    max-width: 960px;
  `
class App extends Component {
  render() {
    return (
      <Router>
        <AppContainer>
          <div className="App-header">
            <h2>Welcome to Hemsyn Client</h2>
          </div>
          <Page>
            <Switch>
              <Route path="/" component={Stats} />
            </Switch>
          </Page>
        </AppContainer>
      </Router>
    );
  }
}

export default App;
