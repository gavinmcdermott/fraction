'use strict'

// Globals
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'

import * as logOutActions from './../../../actions/logOutActions'


function mapStateToProps(state) {
  return {
    currentUser: state.currentUser
  }
}

function mapDispatchToProps(dispatch) {
  return {
    logOut: () => dispatch(logOutActions.logOut())
  }
}

class LogOutContainer extends Component {
  
  componentDidMount() {
    this.props.logOut()
  }

  render() {
    return <div></div>
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LogOutContainer)
