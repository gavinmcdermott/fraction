'use strict'

// Globals
import _ from 'lodash'
import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { Link } from 'react-router'

import userUtils from './../utils/user'


class NavbarComponent extends Component {
  render() {
    const { currentUser } = this.props
    return(
      <div>
        PATH: { this.props.location.pathname }
        <br/>
        <a href="/login">Login</a> | 
        <a href="/logout">Logout</a> |
        <a href="/dashboard">Dashboard</a> |
        { userUtils.isFractionAdmin(currentUser) ? <a href="/admin">Admin</a> : false }
      </div>
    )
  }
}

NavbarComponent.propTypes = {
  currentUser: PropTypes.object.isRequired
}

export default NavbarComponent
