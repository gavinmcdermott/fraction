

// Globals
import _ from 'lodash'
import assert from 'assert'
import React from 'react'
import { Router, Route, IndexRoute } from 'react-router'

import adminContainer from './../containers/adminContainer'
// import adminPropertiesContainer from './../containers/adminPropertiesContainer'



module.exports = (
  <Route>
    <IndexRoute component={ adminContainer } />
    <Route path="properties">
      
    </Route>
  </Route>
)




    // <Route path="properties" component={ adminPropertiesContainer }>

// <IndexRoute component={ adminPropertiesContainer } />