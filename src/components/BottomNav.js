import React, { Component } from 'react'
import { Link, withRouter } from 'react-router-dom'
import BottomNavigation from '@material-ui/core/BottomNavigation'
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction'
import { Map, Search } from '@material-ui/icons'
import './explore.css'

class BottomNav extends Component {
  constructor (props) {
    super(props)
    this.state = {
      value: 0
    }
  }

  // componentWillReceiveProps (newProps) {
  //   const { pathname } = newProps.location
  //   const { pathMap } = this.state
  // }

  handleChange (event, value) {
    this.setState({ value })
  };

  render () {
    const { value } = this.state

    return (
      <BottomNavigation
        value={value}
        onChange={this.handleChange}
        showLabels
        className='bottom-nav'
      >
        <BottomNavigationAction label='Search' icon={<Search />} component={Link} to='/' />
        <BottomNavigationAction label='Map' icon={<Map />} component={Link} to='/explore' />
      </BottomNavigation>
    )
  }
}

export default withRouter(BottomNav)
