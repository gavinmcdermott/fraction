

// Globals
import _ from 'lodash'
import assert from 'assert'
import React from 'react'
import { Router, Route, IndexRoute } from 'react-router'

import adminContainer from './../containers/adminContainer'
import adminPropertiesContainer from './../containers/adminPropertiesContainer'
import adminCreatePropertyContainer from './../containers/adminCreatePropertyContainer'



module.exports = (
  <Route>
    <IndexRoute component={ adminContainer } />
    
    <Route path="properties">
      <IndexRoute component={ adminPropertiesContainer } />
      <Route path="create" component={ adminCreatePropertyContainer } />
    </Route>
    
  </Route>
)




    // <Route path="properties" component={ adminPropertiesContainer }>

// <IndexRoute component={ adminPropertiesContainer } />