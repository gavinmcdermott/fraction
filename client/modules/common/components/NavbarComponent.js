'use strict'

// Globals
import _ from 'lodash'
import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { Link } from 'react-router'

import userUtils from './../../../utils/user'


class NavbarComponent extends Component {
  
  loggedOut() {
    return (
      <span>
        <Link to="/">Home</Link> | 
        <Link to="/login">Login</Link> |
        <Link to="/signup">Signup</Link>
      </span>
    )
  }

  loggedIn() {
    return (
      <span>
        { userUtils.isFractionAdmin(this.props.currentUser) ? <Link to="/admin">Admin</Link> : false } |
        <Link to="/investments">Dashboard</Link> |
        <Link to="/logout">Logout</Link>
      </span>
    )
  }

  render() {
    const { currentUser } = this.props
    return(
      <div>
        <br/>
        { this.props.currentUser.isLoggedIn ? this.loggedIn() : this.loggedOut() }
        <hr/>
      </div>
    )
  }
}

NavbarComponent.propTypes = {
  currentUser: PropTypes.object.isRequired
}

export default NavbarComponent


// Navbar (cur path: { this.props.location.pathname }) 