'use strict'

// Globals
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { Link } from 'react-router'


export default class appContainer extends Component {
  render() {
    return(
      <div>
        == app container rendered ==
        <br/>
        {this.props.children}
      </div>
    )
  }
}
