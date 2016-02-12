'use strict'

// Globals
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import ReactDOM from 'react-dom'

import AdminPropertiesComponent from './../components/AdminPropertiesComponent'
import * as actions from './../../../actions/propertyActions'


function mapStateToProps(state) {
  return {
    properties: state.properties
  }
}


function mapDispatchToProps(dispatch) {
  return {
    fetchProperties: () => dispatch(actions.fetchProperties())
  }
}

class AdminContainer extends Component {

  componentWillMount() {
    this.props.fetchProperties()
  }

  render() {
    return(
      <AdminPropertiesComponent { ...this.props } ></AdminPropertiesComponent>
    )
  }
}

AdminContainer.propTypes = {
  properties: PropTypes.object.isRequired
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminContainer)
