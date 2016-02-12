'use strict'

// Globals
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'

// Locals
import LandingComponent from './../components/LandingComponent'
import * as actions from './../../../actions/propertyActions'
import { useCacheFrom } from './../../../utils/api'


function mapStateToProps(state) {
  return {
    properties: state.properties
  }
}


function mapDispatchToProps(dispatch) {
  return {
    fetchProperties: (loadFromCache) => dispatch(actions.fetchProperties(loadFromCache))
  }
}

class LandingContainer extends Component {

  componentWillMount() {
    let usePropertyCache = useCacheFrom(this.props.properties)
    this.props.fetchProperties(usePropertyCache)
  }

  render() {
    return(
      <LandingComponent {...this.props}></LandingComponent>
    )
  }
}

LandingContainer.propTypes = {
  properties: PropTypes.object.isRequired
}

export default connect(mapStateToProps, mapDispatchToProps)(LandingContainer)
