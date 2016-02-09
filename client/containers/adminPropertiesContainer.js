'use strict'

// Globals
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import ReactDOM from 'react-dom'

import AdminPropertiesComponent from './../components/AdminPropertiesComponent'


function mapStateToProps(state) {
  return {
    currentUser: state.currentUser
  }
}


function mapDispatchToProps(dispatch) {
  return {
    // submit: (newUser) => dispatch(actions.signUp(newUser))
  }
}

class adminContainer extends Component {
  render() {
    return(
      <AdminPropertiesComponent { ...this.props } ></AdminPropertiesComponent>
    )
  }
}

// AdminPropertiesComponent.propTypes = {
//   currentUser: PropTypes.object.isRequired
// }

export default connect(mapStateToProps, mapDispatchToProps)(adminContainer)
