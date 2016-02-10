'use strict'

// Globals
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import ReactDOM from 'react-dom'

import NavbarComponent from './../components/NavbarComponent'


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

class navbarContainer extends Component {
  render() {
    return(
      <NavbarComponent { ...this.props } ></NavbarComponent>
    )
  }
}

navbarContainer.propTypes = {
  currentUser: PropTypes.object.isRequired
}

export default connect(mapStateToProps, mapDispatchToProps)(navbarContainer)
