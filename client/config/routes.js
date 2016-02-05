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
import logOutContainer from './../containers/logOutContainer'
import signUpContainer from './../containers/signUpContainer'
import { currentUserFetch } from './../actions/userActions'


module.exports = (store) => {
  assert(_.isObject(store))

  // For info on the callback see: 
  // https://github.com/rackt/react-router/blob/master/docs/API.md#onenternextstate-replace-callback
  const ensureAuthenticated = (nextState, replaceState, callback) => {
    const user = store.getState().currentUser
    const hasToken = user.token
    const loggedIn = user.isLoggedIn
    
    // https://github.com/tuxracer/simple-storage
    const checkAuth = () => {
      const { currentUser } = store.getState()
      if (!currentUser.token) {
        // TODO: REMOVE when happy with network error handling
        console.warn('PROTECTED ROUTE! REDIRECTING TO /LOGIN')
        replaceState(null, '/login')
      }
      callback()
    }
    
    // If there is a token found on the user and they aren't logged in,
    // attempt to fetch their info, otherwise they need to sign in
    if (hasToken && !loggedIn) {
      store.dispatch(currentUserFetch()).then(checkAuth)
    } else {
      checkAuth()
    }
  }

  return (
    <Route path="/" component={ appContainer }>
      <IndexRoute component={ landingContainer } />
      <Route path="signup" component={ signUpContainer } />
      <Route path="login" component={ logInContainer } />
      <Route path="logout" component={ logOutContainer } />
      
      <Route onEnter={ ensureAuthenticated } >
        <Route path="dashboard" component={ dashboardContainer } />
      </Route>
    </Route>
  )
}
