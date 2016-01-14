'use strict'

// Globals
import React, { Component, PropTypes } from 'react'


export default class TextInput extends Component {

  getInitialState() {
    return { value: 'Hello!' };
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
  }

  render() {
    let value = this.state.value;
    return <input type={ this.props.type } ref='input' value={ value } onChange={ this.handleChange } />;
  }
}; 

TextInput.propTypes = {
  handleChange: PropTypes.func.isRequired
  type: PropTypes.string.isRequired
};
