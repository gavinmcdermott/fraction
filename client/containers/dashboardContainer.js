'use strict'

// Globals
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { Link } from 'react-router'


export default class dashboardContainer extends Component {
  render() {
    return(
      <div>
        <h1>Your Dashboard</h1>
        <h3>This is a protected route</h3>
        <hr/>
      </div>
    )
  }
}


// <p>You can really only <Link to="/logout">log out</Link>...</p>