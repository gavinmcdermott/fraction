'use strict'

// Globals
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import ReactDOM from 'react-dom'

import SignUpFormComponent from './../components/SignUpFormComponent'
import * as actions from './../actions/signUpActions'


// Define the parts of Redux global state that our component
// will receive as props for consumption
function mapStateToProps(state) {
  return {
    currentUser: state.currentUser,
    appErrors: state.appErrors
  }
}

// Which action creators does it want to receive by props?
function mapDispatchToProps(dispatch) {
  return {
    submit: (newUser) => dispatch(actions.signUp(newUser))
  }
}

class SignUpContainer extends Component {
  render() {
    return(
      <SignUpFormComponent { ...this.props } />
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SignUpContainer)
