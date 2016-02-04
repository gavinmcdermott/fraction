'use strict'

// Globals
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'
import { Link } from 'react-router'

import * as actions from './../actions/logOutActions'


function mapStateToProps(state) {
  return {}
}

function mapDispatchToProps(dispatch) {
  return {
    logout: () => dispatch(actions.logOut())
  }
}

export default class DashboardContainer extends Component {
  render() {
    return(
      <div>
        <h1>Your Dashboard</h1>
        <h3>This is a protected route</h3>
        The only thing to do is...<a onClick={ this.props.logout }>logout</a>
        <hr/>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DashboardContainer)