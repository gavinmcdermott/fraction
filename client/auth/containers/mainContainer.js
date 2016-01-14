'use strict'

// Globals
import React, { Component } from 'react'
import ReactDOM from 'react-dom'


export default class Main extends Component {
  render() {
    return(<div>Main: <br/>{ this.props.children }</div>);
  }
}; 
