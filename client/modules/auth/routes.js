'use strict'

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Route } from 'react-router'

import logInContainer from './containers/logInContainer'
import logOutContainer from './containers/logOutContainer'
import signUpContainer from './containers/signUpContainer'


module.exports = (
  <Route>
    <Route path="signup" component={ signUpContainer } />
    <Route path="login" component={ logInContainer } />
    <Route path="logout" component={ logOutContainer } />
  </Route>
)
