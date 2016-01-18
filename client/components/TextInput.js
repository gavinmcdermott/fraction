'use strict'

// Globals
import React, { Component, PropTypes } from 'react'


export default class TextInput extends Component {

  constructor(props) {
    super(props)
    // console.log(this.state)
    this.state = {
      value: this.props.value
    }
  }

  handleChange(event) {
    this.setState({ value: event.target.value })
    this.props.foo(event.target.value)
  }

  render() {
    let value = this.state.value;
    return <input type={ this.props.type } ref='input' value={ this.state.value } onChange={ this.handleChange.bind(this) } />;
  }
} 

TextInput.propTypes = {
  foo: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired
}
