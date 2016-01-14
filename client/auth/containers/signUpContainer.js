'use strict'

// Globals
import React, { Component } from 'react'
import ReactDOM from 'react-dom'

import SignUpComponent from './../components/signUpComponent'


export default class SignUpContainer extends Component {
  render() {
    return(
      <div>
        This is Signup
        <br/>
        <SignUpComponent />
      </div>
    );
  }
}; 