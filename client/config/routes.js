'use strict'

// Globals
import _ from 'lodash'
import assert from 'assert'
import React from 'react'
import { Router, Route, IndexRoute } from 'react-router'

import appContainer from './../containers/appContainer'
import dashboardContainer from './../containers/dashboardContainer'
import landingContainer from './../containers/landingContainer'
import logInContainer from './../containers/logInContainer'
import logOutContainer from './../containers/logOutContainer'
import signUpContainer from './../containers/signUpContainer'

import adminRoutes from './adminRoutes'

import { fetchCurrentUser } from './../actions/userActions'
import userUtils from './../utils/user'


module.exports = (store) => {
  assert(_.isObject(store))

  function getUser() {
    return store.getState().currentUser
  }

  // For info on the callback see: 
  // https://github.com/rackt/react-router/blob/master/docs/API.md#onenternextstate-replace-callback
  // https://github.com/tuxracer/simple-storage
  // the callback must be invoked if it is passed
  const ensureAuthenticated = (nextState, replaceState, callback) => {
    const user = getUser()
    const hasToken = user.token
    const loggedIn = user.isLoggedIn
    
    const checkAuth = () => {
      const currentUser = getUser()
      if (!currentUser.token) {
        console.log('NOT LOGGED IN => GO TO LOGIN')
        replaceState(null, '/login')
      }
      callback()
    }
    
    // If there is a token found on the user and they aren't logged in,
    // attempt to fetch their info, otherwise they need to sign in
    if (hasToken && !loggedIn) {
      store.dispatch(fetchCurrentUser()).then(checkAuth)
    } else {
      checkAuth()
    }
  }

  const ensureFractionAdmin = (nextState, replaceState) => {
    if (userUtils.isFractionAdmin(getUser())) {
      return true
    }
    console.log('NOT AN ADMIN => GO TO LOGIN')
    return replaceState(null, '/login')
  }

  return (
    <Route path="/" component={ appContainer }>
      <IndexRoute component={ landingContainer } />
      <Route path="signup" component={ signUpContainer } />
      <Route path="login" component={ logInContainer } />
      <Route path="logout" component={ logOutContainer } />
      
      <Route onEnter={ ensureAuthenticated } >        
        <Route path="dashboard" component={ dashboardContainer } />
        
        <Route path="admin" onEnter={ ensureFractionAdmin }>
          { adminRoutes }
        </Route>
      </Route>
    </Route>
  )
}
