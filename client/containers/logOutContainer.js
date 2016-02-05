'use strict'

// Globals
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'

import * as logOutActions from './../actions/logOutActions'


class LogOutContainer extends Component {
  render() {
    console.warn('USER SENT TO /logout => WIPING TOKEN => DISPATCH LOGOUT ACTION')
    this.props.dispatch(logOutActions.logOut())
    return <div></div>
  }
}

export default connect()(LogOutContainer)
