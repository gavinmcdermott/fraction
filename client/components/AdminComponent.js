'use strict'

// Globals
import _ from 'lodash'
import validator from 'validator'
import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { Link } from 'react-router'

class AdminComponent extends Component {
  render() {
    return(
      <div>
        <h2>Important Admin Stuff</h2>
        <Link to="/admin/properties">Manage Fraction Properties</Link>
      </div>
    )
  }
}

// AdminComponent.propTypes = {
//   submit: PropTypes.func.isRequired,
//   appErrors: PropTypes.array.isRequired,
//   currentUser: PropTypes.object.isRequired
// }

export default AdminComponent
