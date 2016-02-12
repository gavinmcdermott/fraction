'use strict'

// Globals
import React from 'react'
import ReactDOM from 'react-dom'
import { Router } from 'react-router'
import { Provider } from 'react-redux'
import { syncReduxAndRouter } from 'redux-simple-router'

// Locals
import { history } from './config/history'
import routes from './config/routes'
import store from './config/store'


syncReduxAndRouter(history, store)

ReactDOM.render(
  <Provider store={ store }>
    <Router history={ history }>
      { routes }
    </Router>
  </Provider>, 
  document.getElementById('root')
)


// TEMP APP NOTES: 
// To use for error logs:
// use this: https://getsentry.com/welcome/

// Components and composition
// https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0
// https://github.com/rackt/redux-simple-router/blob/1.0.2/examples/basic/app.js

// FSA
// https://github.com/acdlite/flux-standard-action

// routing
// https://github.com/rackt/react-router/blob/master/docs/guides/advanced/NavigatingOutsideOfComponents.md