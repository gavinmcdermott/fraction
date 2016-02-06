'use strict'

// Globals
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { Link } from 'react-router'

import NavbarContainer from './navbarContainer'

export default class appContainer extends Component {
  render() {
    return(
      <div>
        <NavbarContainer { ...this.props } ></NavbarContainer>
        <br/>
        { this.props.children }
      </div>
    )
  }
}
