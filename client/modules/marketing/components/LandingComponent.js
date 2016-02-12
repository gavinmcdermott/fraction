'use strict'

// Globals
import _ from 'lodash'
import validator from 'validator'
import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'

class LandingComponent extends Component {
  render() {
    return(
      <div>
        <h2>Welcome to Fraction</h2>
        <br/>
        {_.map(this.props.properties.propertiesList, (p) => {
          return (
            <h3 key={p.id}><Link to={`/properties/${p.id}`}>Go to {p.location.address1}</Link></h3>
          )
        })}
      </div>
    )
  }
}

LandingComponent.propTypes = {
  properties: PropTypes.object.isRequired,
}

export default LandingComponent
