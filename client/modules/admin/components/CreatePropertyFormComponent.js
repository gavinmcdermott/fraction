'use strict'

// Globals
import _ from 'lodash'
import validator from 'validator'
import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { reduxForm } from 'redux-form'
import { Link } from 'react-router'


const validate = (values) => {
  const errors = {}
  // if (!values.email) {
  //   errors.email = 'Required'
  // } else if (!validator.isEmail(values.email)) {
  //   errors.email = 'Must be a valid email'
  // }

  // if (!values.password) {
  //   errors.password = 'Required'
  // } else if (values.password.length < 8) {
  //   errors.password = 'Password too short' 
  // }
  return errors
}


class CreatePropertyFormComponent extends Component {
  render() {
    const { fields: { address1, address2, city, state, zip, bedrooms, bathrooms, sqft }, handleSubmit, submit } = this.props
    return(
      <form onSubmit={handleSubmit(submit)}>
        
        <h2>Add a new property to the platform</h2>

        <h3>address</h3>
        address1: <input type="text" {...address1} /><br/>
        address2: <input type="text" {...address2} /><br/>
        city: <input type="text" {...city} /><br/>
        state: <input type="text" {...state} /><br/>
        zip: <input type="number" {...zip} /> 
        <br/>
        <br/>

        <h3>details</h3>
        bedrooms: <input type="number" {...bedrooms} /><br/>
        bathrooms: <input type="number" {...bathrooms} /><br/>
        sqft: <input type="number" {...sqft} />
        <br/>
        <br/>

        <button type="submit">Add Property</button>
        <br/>
        <hr/>
        <p><Link to="/admin/properties">Go back to all properties</Link></p>
      </form>
    )
  }
}

CreatePropertyFormComponent.propTypes = {
  submit: PropTypes.func.isRequired
}


CreatePropertyFormComponent = reduxForm({
  form: 'CreatePropertyForm',
  fields: ['address1', 'address2', 'city', 'state', 'zip', 'bedrooms', 'bathrooms', 'sqft'],
  validate
})(CreatePropertyFormComponent)


export default CreatePropertyFormComponent
