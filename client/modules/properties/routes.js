'use strict'

import React from 'react'
import { Route } from 'react-router'

import propertyPageContainer from './containers/propertyPageContainer'


module.exports = (
  <Route path="properties">
    <Route path=":propertyId" component={ propertyPageContainer } />
  </Route>
)
 
