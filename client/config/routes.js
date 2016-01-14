'use strict'

// Globals
import React from 'react'
import { Provider } from 'react-redux'
import { createStore, combineReducers } from 'redux'
import { Router, Route, IndexRoute } from 'react-router'

import Main from './../auth/containers/mainContainer'
import SignUpContainer from './../auth/containers/signUpContainer'
import LogIn from './../auth/containers/logInContainer'


module.exports = (
  <Route path="/" component={ Main }>
    <IndexRoute component={ Main } />
    <Route path="signup" component={ SignUpContainer } />
    <Route path="login" component={ LogIn } />
  </Route>
);


