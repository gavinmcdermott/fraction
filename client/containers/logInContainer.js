'use strict'

// Globals
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'

import LogInFormComponent from './../components/LogInFormComponent'
import * as actions from './../actions/logInActions'


function mapStateToProps(state) {
  return {
    currentUser: state.currentUser,
    appErrors: state.appErrors
  }
}

function mapDispatchToProps(dispatch) {
  return {
    submit: (pendingUser) => dispatch(actions.logIn(pendingUser))
  }
}

class LogInContainer extends Component {
  render() {
    return(
      <LogInFormComponent { ...this.props } />
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LogInContainer)
