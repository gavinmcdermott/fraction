'use strict'

// Globals
import _ from 'lodash'
import validator from 'validator'
import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'

class PropertyPageComponent extends Component {
  render() {
    // pass this through
    const property = this.props.properties.propertiesById[this.props.params.propertyId]
    return(
      <div>
        <h2>Take a look at { property ? property.id : null }</h2>
        <br/>
      </div>
    )
  }
}

PropertyPageComponent.propTypes = {
  properties: PropTypes.object.isRequired,
}

export default PropertyPageComponent

// {this.props.property.id}