'use strict'

// Globals
import _ from 'lodash'
import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { Link } from 'react-router'

import userUtils from './../utils/user'


class NavbarComponent extends Component {
  
  loggedOut() {
    return (
      <span>
        <a href="/">Landing</a> | 
        <a href="/login">Login</a> |
        <a href="/signup">Signup</a>
      </span>
    )
  }

  loggedIn() {
    return (
      <span>
        { userUtils.isFractionAdmin(this.props.currentUser) ? <a href="/admin">Admin</a> : false } |
        <a href="/dashboard">Dashboard</a> |
        <a href="/logout">Logout</a>
      </span>
    )
  }

  render() {
    const { currentUser } = this.props
    return(
      <div>
        Navbar (cur path: { this.props.location.pathname }) 
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
