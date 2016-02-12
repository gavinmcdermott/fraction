'use strict'

// Globals
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import moment from 'moment'

import NavbarContainer from './../../common/containers/navbarContainer'
import * as actions from './../../../actions/propertyActions'

function mapStateToProps(state) {
  return {
    properties: state.properties
  }
}


function mapDispatchToProps(dispatch) {
  return {
    fetchProperties: () => {
      dispatch(actions.fetchProperties())
    }
  }
}

class MainContainer extends Component {

  componentWillMount() {
    // Bootstrap data for the app
    this.props.fetchProperties()
  }

  render() {
    return(
      <div>
        <NavbarContainer { ...this.props } ></NavbarContainer>
        <br/>
        { this.props.children }
      </div>
    )
  }
}

MainContainer.propTypes = {
  properties: PropTypes.object.isRequired
}

export default connect(mapStateToProps, mapDispatchToProps)(MainContainer)
