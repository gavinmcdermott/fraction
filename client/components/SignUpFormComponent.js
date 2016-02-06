'use strict'

// Globals
import _ from 'lodash'
import validator from 'validator'
import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { reduxForm } from 'redux-form'
import { Link } from 'react-router'

import { CURRENT_USER_ERROR } from './../constants/errorTypes'


const validate = (values) => {
  const errors = {}
  if (!values.firstName) {
    errors.firstName = 'Required'
  }
  if (!values.lastName) {
    errors.lastName = 'Required'
  }
  if (!values.email) {
    errors.email = 'Required'
  } else if (!validator.isEmail(values.email)) {
    errors.email = 'Must be a valid email'
  }
  if (!values.password) {
    errors.password = 'Required'
  } else if (values.password.length < 8) {
    errors.password = 'Password too short' 
  }
  return errors
}


class SignUpFormComponent extends Component {
  render() {
    const { fields: { firstName, lastName, email, password }, handleSubmit, submit } = this.props
    return(
      <form onSubmit={handleSubmit(submit)}>
        <h1>Sign Up</h1>
        <strong>Client-side / sync error testing</strong>
        <br/>
        email error: {this.props.errors.email}
        <br/>
        pw error: {this.props.errors.password}
        <hr/>
        <br/>
        First: <input type="text" {...firstName} />
        <br/>
        Last: <input type="text" {...lastName} />
        <br/>
        Email: <input type="email" {...email} />
        <br/>
        Password: <input type="password" {...password} />
        <br/>
        <button type="submit">Sign Up</button>
        <br/>
        <hr/>
        <p><Link to="/">Go to the landing page</Link></p>
        <p><Link to="/login">Go to the login page</Link></p>
      </form>
    )
  }
}

SignUpFormComponent.propTypes = {
  submit: PropTypes.func.isRequired,
  appErrors: PropTypes.array.isRequired,
  currentUser: PropTypes.object.isRequired
}


SignUpFormComponent = reduxForm({
  form: 'SignUpForm',
  fields: ['firstName', 'lastName', 'email', 'password'],
  validate
})(SignUpFormComponent)


export default SignUpFormComponent
