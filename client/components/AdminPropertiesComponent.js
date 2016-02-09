'use strict'

// Globals
import _ from 'lodash'
import validator from 'validator'
import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
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
        [ TODO: Fetch all properties on container load ]
      </div>
    )
  }
}

// AdminPropertiesComponent.propTypes = {
//   submit: PropTypes.func.isRequired,
//   appErrors: PropTypes.array.isRequired,
//   currentUser: PropTypes.object.isRequired
// }

export default AdminPropertiesComponent
