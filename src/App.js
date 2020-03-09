import React from 'react'
import 'antd/dist/antd.css' // This is here solely because MaterialUI doesn't have a carousel component
import './components/explore.css'
import LandingPage from './components/LandingPage'
import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom'
import Explore from './components/Explore'
import BottomNav from './components/BottomNav'

function App (props) {
  return (
    <Router>
      <Switch>
        <Route path='/' exact>
          <LandingPage />
          <BottomNav />
        </Route>
        <Route path='/explore'>
          <Explore containerComponent={props.containerComponent} />
          <BottomNav />
        </Route>
      </Switch>
    </Router>
  )
}

export default App
