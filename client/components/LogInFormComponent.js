'use strict'

// Globals
import _ from 'lodash'
import validator from 'validator'
import React, { Component, dispatch, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { reduxForm } from 'redux-form'
import { Link } from 'react-router'

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


class LogInFormComponent extends Component {
  render() {
    const { fields: { email, password }, handleSubmit, submit } = this.props
    return(
      <form onSubmit={handleSubmit(submit)}>
        <h1>Log In</h1>
        <strong>Client-side / sync error testing</strong>
        <br/>
        email error: {this.props.errors.email}
        <br/>
        pw error: {this.props.errors.password}
        <hr/>
        <br/>
        Email: <input type="email" {...email} />
        <br/>
        Password: <input type="password" {...password} />
        <br/>
        <button onClick={handleSubmit(submit)}>Log In</button>
        <br/>
        <hr/>
        <p><Link to="/">Go to the landing page</Link></p>
        <p><Link to="/signup">I need to create an account</Link></p>
      </form>
    )
  }
}

LogInFormComponent.propTypes = {
  submit: PropTypes.func.isRequired,
  appErrors: PropTypes.array.isRequired,
  currentUser: PropTypes.object.isRequired
}


LogInFormComponent = reduxForm({
  form: 'LogInForm',
  fields: ['email', 'password'],
  validate
})(LogInFormComponent)


export default LogInFormComponent
