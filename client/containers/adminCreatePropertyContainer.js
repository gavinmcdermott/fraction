'use strict'

// Globals
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import ReactDOM from 'react-dom'

import CreatePropertyFormComponent from './../components/CreatePropertyFormComponent'
import * as actions from './../actions/propertyActions'


function mapStateToProps(state) {
  return {}
}


function mapDispatchToProps(dispatch) {
  return {
    submit: (newProperty) => dispatch(actions.createProperty(newProperty))
  }
}

class adminContainer extends Component {
  render() {
    return(
      <CreatePropertyFormComponent { ...this.props } ></CreatePropertyFormComponent>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(adminContainer)
