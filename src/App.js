import React, { Component } from 'react'
import Navbar from './Navbar';
import Home from './Home'
import { BrowserRouter as Router, DebugRouter, Route, Switch } from 'react-router-dom';
import DataSets from './DataSets';
import Help from './Help';
class App extends Component {

  render() {
    return (
      <Router>
        <DebugRouter>
          <div className='App'>
            <Navbar />
            <div className='content'>
              <Switch>
                <Route exact path='/'>
                  <Home />
                </Route>
                <Route path='/datasets'>
                  <DataSets />
                </Route>
                <Route path='/help'>
                  <Help />
                </Route>
              </Switch>
            </div>
          </div>
        </DebugRouter>
      </Router>
    );
  }
}

export default App;