'use strict'

// Globals
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import ReactDOM from 'react-dom'
import { Link } from 'react-router'

// import AdminComponent from './../components/AdminComponent'


function mapStateToProps(state) {
  return {
    // currentUser: state.currentUser
  }
}


function mapDispatchToProps(dispatch) {
  return {
    // submit: (newUser) => dispatch(actions.signUp(newUser))
  }
}

class adminContainer extends Component {
  render() {
    return(
      <div>
        <h2>Admin Dashboard</h2>
        <Link to="/admin/properties">Manage Properties</Link>
      </div>
    )
  }
}

// AdminComponent.propTypes = {
//   currentUser: PropTypes.object.isRequired
// }

export default connect(mapStateToProps, mapDispatchToProps)(adminContainer)
