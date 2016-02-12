'use strict'

import React from 'react'
import { Route, IndexRoute } from 'react-router'

import investmentsContainer from './containers/investmentsContainer'


module.exports = (
  <Route path="investments">
    <IndexRoute component={ investmentsContainer } />
  </Route>
)
 