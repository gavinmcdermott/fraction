'use strict'

// Globals
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { Link } from 'react-router'

import NavbarContainer from './../../common/containers/navbarContainer'

export default class mainContainer extends Component {
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
