'use strict'

// Globals
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { Link } from 'react-router'


export default class LandingContainer extends Component {
  render() {
    return(
      <div>
        <h1>Welcome to Fraction!</h1>
        <h3>This is a fancy landing page</h3>
        <p>Don't you feel compelled to <Link to="/signup">sign up</Link>?</p>
        <hr/>
        <p><Link to="/login">Or just login</Link></p>
      </div>
    )
  }
}
