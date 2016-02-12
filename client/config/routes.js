'use strict'

// Globals
import _ from 'lodash'
import assert from 'assert'
import React from 'react'
import { Router, Route, IndexRoute } from 'react-router'

import store from './store'

// The App main container
import mainContainer from './../modules/main/containers/mainContainer'

// Routes for all modules
import authRoutes from './../modules/auth/routes'
import adminRoutes from './../modules/admin/routes'
import marketingRoutes from './../modules/marketing/routes'
import investmentsRoutes from './../modules/investments/routes'
import propertiesRoutes from './../modules/properties/routes'

import { fetchCurrentUser } from './../actions/userActions'

// For info on the callback see: 
// https://github.com/rackt/react-router/blob/master/docs/API.md#onenternextstate-replace-callback
// the callback must be invoked if it is passed
const ensureAuthenticated = (nextState, replaceState, callback) => {

  const getUserFromStore = () => {
    return store.getState().currentUser
  }

  const checkIfUserAuthenticated = () => {
    const currentUser = getUserFromStore()
    if (!currentUser.token) {
      console.warn('NOT LOGGED IN => GO TO LOGIN')
      replaceState(null, '/login')
    }
    callback()
  }

  const user = getUserFromStore()
  const hasToken = user.token
  const loggedIn = user.isLoggedIn
    
  // If there is a token found on the user and they aren't logged in,
  // attempt to fetch their info, otherwise they need to sign in
  if (hasToken && !loggedIn) {
    store.dispatch(fetchCurrentUser()).then(checkIfUserAuthenticated)
  } else {
    checkIfUserAuthenticated()
  }
}


// Export the App

module.exports = (
  <Route path="/" component={ mainContainer }>
    { propertiesRoutes }
    { marketingRoutes }
    { authRoutes }
    <Route onEnter={ ensureAuthenticated }>
      { investmentsRoutes }
      { adminRoutes }
    </Route>
  </Route>
)
