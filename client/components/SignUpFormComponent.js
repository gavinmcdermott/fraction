'use strict'

// Globals
import _ from 'lodash'
import validator from 'validator'
import React, { Component, dispatch, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { reduxForm } from 'redux-form'

import { CURRENT_USER_ERROR } from './../constants/errorTypes'


const validate = (values) => {
  const errors = {}
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
    const { fields: { email, password }, handleSubmit, submit } = this.props
    return(
      <form onSubmit={handleSubmit(submit)}>
        <h1>Sign up for Fraction</h1>
        <br/>
        Test email error: {this.props.errors.email}
        <br/>
        Test pw error: {this.props.errors.password}
        <br/>
        <input type="email" {...email} />
        <br/>
        <input type="password" {...password} />
        <br/>
        <button onClick={handleSubmit(submit)}>Sign Up</button>
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
  fields: ['email', 'password'],
  validate
})(SignUpFormComponent)


export default SignUpFormComponent
