'use strict'

// Globals
import thunkMiddleware from 'redux-thunk'
import { routeReducer } from 'redux-simple-router'
import { reducer as formReducer } from 'redux-form';
import { combineReducers, createStore, applyMiddleware } from 'redux'

// Locals
import currentUserReducer from './../reducers/currentUserReducers'
import appErrorReducer from './../reducers/appErrorReducers'
import propertiesReducer from './../reducers/propertiesReducers'

// Build the main app's reducer
const appReducer = combineReducers({
  form: formReducer,
  appErrors: appErrorReducer,
  currentUser: currentUserReducer,
  properties: propertiesReducer,
  routing: routeReducer
})

// Create the app's store with middleware
const createStoreWithMiddleware = applyMiddleware(
  thunkMiddleware
)(createStore)

module.exports = createStoreWithMiddleware(appReducer)
