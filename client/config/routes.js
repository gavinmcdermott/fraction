'use strict'

// Globals
import _ from 'lodash'
import assert from 'assert'
import React from 'react'
import { Provider } from 'react-redux'
import { createStore, combineReducers } from 'redux'
import { Router, Route, IndexRoute } from 'react-router'

import appContainer from './../containers/appContainer'
import dashboardContainer from './../containers/dashboardContainer'
import landingContainer from './../containers/landingContainer'
import logInContainer from './../containers/logInContainer'
import signUpContainer from './../containers/signUpContainer'
import { currentUserFetch } from './../actions/userActions'


module.exports = (appStore) => {
  assert(_.isObject(appStore))

  // For info on the callback see: 
  // https://github.com/rackt/react-router/blob/master/docs/API.md#onenternextstate-replace-callback
  const ensureAuthenticated = (nextState, replaceState, callback) => {
    const existingToken = appStore.getState().currentUser.token
  
    console.log(existingToken)

    const checkAuth = () => {
      const { currentUser } = appStore.getState()
      if (!currentUser.token) {
        // TODO: REMOVE when happy with network error handling
        console.warn('PROTECTED ROUTE! REDIRECTING TO /LOGIN')
        replaceState(null, '/login')
      }
      callback()
    }
    
    if (existingToken) {
      appStore.dispatch(currentUserFetch()).then(checkAuth)
    } else {
      checkAuth()
    }
  }

  return (
    <Route path="/" component={ appContainer }>
      <IndexRoute component={ landingContainer } />
      <Route path="signup" component={ signUpContainer } />
      <Route path="login" component={ logInContainer } />
      
      <Route onEnter={ ensureAuthenticated } >
        <Route path="dashboard" component={ dashboardContainer } />
      </Route>
    </Route>
  )
}