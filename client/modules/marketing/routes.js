'use strict'

import React from 'react'
import { Route, IndexRoute } from 'react-router'

import landingContainer from './containers/landingContainer'


module.exports = (
  <Route>
    <IndexRoute component={ landingContainer } />
  </Route>
)
 
