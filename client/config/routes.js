'use strict'

// Globals
import React from 'react'
import { Provider } from 'react-redux'
import { createStore, combineReducers } from 'redux'
import { Router, Route, IndexRoute } from 'react-router'

import { Main } from './../moduleMain/index'
import { SignUp, LogIn } from './../moduleAuth/index'






module.exports = (
  <Route path="/" component={ Main }>
    <IndexRoute component={ Main } />
    <Route path="signup" component={ SignUp }></Route>
    <Route path="login" component={ LogIn }></Route>
  </Route>
);


