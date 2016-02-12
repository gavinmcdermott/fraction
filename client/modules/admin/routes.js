'use strict'

import React from 'react'
import { Route, IndexRoute } from 'react-router'

import store from './../../config/store'
import userUtils from './../../utils/user'

import adminContainer from './containers/adminContainer'
import adminPropertiesContainer from './containers/adminPropertiesContainer'
import adminCreatePropertyContainer from './containers/adminCreatePropertyContainer'


const ensureFractionAdmin = (nextState, replaceState) => {
  
  const getUserFromStore = () => {
    return store.getState().currentUser
  }

  if (userUtils.isFractionAdmin(getUserFromStore())) {
    return true
  }
  console.warn('NOT AN ADMIN => GO TO LOGIN')
  return replaceState(null, '/login')
}


// Export the Admin Routes

module.exports = (
  <Route path="admin" onEnter={ ensureFractionAdmin }>
    <IndexRoute component={ adminContainer } />
    <Route path="properties">
      <IndexRoute component={ adminPropertiesContainer } />
      <Route path="create" component={ adminCreatePropertyContainer } />
    </Route>
  </Route>
)
