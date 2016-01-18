'use strict'

// Globals
import React from 'react'
import { Provider } from 'react-redux'
import { createStore, combineReducers } from 'redux'
import { Router, Route, IndexRoute } from 'react-router'

import Main from './../containers/mainContainer'
import signUpContainer from './../containers/signUpContainer'
import logInContainer from './../containers/logInContainer'


module.exports = (
  <Route path="/" component={ Main }>
    <IndexRoute component={ Main } />
    <Route path="signup" component={ signUpContainer } />
    <Route path="login" component={ logInContainer } />
  </Route>
)


