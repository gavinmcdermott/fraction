'use strict'

// Globals
import _ from 'lodash'
import validator from 'validator'
import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'

class AdminPropertiesComponent extends Component {
  render() {
    return(
      <div>
        <h2>Admin property management</h2>
        <Link to="/admin">Back</Link>
        <br/>
        <Link to="/admin/properties/create">Add new property</Link>
        <br/>
        <hr/>
        { _.map(this.props.properties.propertiesList, (p) => {
          return (<h3 key={p.id}><a href="">{ p.location.address1 }</a></h3>)
        }) }
      </div>
    )
  }
}

AdminPropertiesComponent.propTypes = {
  properties: PropTypes.object.isRequired,
}

export default AdminPropertiesComponent
