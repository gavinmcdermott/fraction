'use strict'

// Globals
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'
import { Link } from 'react-router'

import * as actions from './../../../actions/logOutActions'


function mapStateToProps(state) {
  return {}
}

function mapDispatchToProps(dispatch) {
  return {
    logout: () => dispatch(actions.logOut())
  }
}

export default class InvestmentsContainer extends Component {
  render() {
    return(
      <div>
        <h1>Your Investments</h1>
        <h3>This is a protected route</h3>
        Now you can...
        <h3><a onClick={ this.props.logout }>logout</a></h3>
        <h3><Link to="/admin">or hit the admin</Link></h3>
        <hr/>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(InvestmentsContainer)
