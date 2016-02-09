'use strict'

// Globals
import { combineReducers } from 'redux'
import storage from './../vendor/store'

import {
  CREATE_PROPERTY_START, 
  CREATE_PROPERTY_SUCCESS, 
  CREATE_PROPERTY_ERROR 
} from './../constants/actionTypes'

const placeholderProperties = {
  isUpdating: false,
  propertiesById: {},
  properties: []
}

export function properties(state=placeholderProperties, action) {
  let newState = Object.assign({}, state)
  
  switch (action.type) {
    
    // CREATE_PROPERTY
    case CREATE_PROPERTY_START:
      newState.isUpdating = true
      return newState
    
    case CREATE_PROPERTY_SUCCESS:
      newState.isUpdating = false
      console.log('HAVE A NEW PROP: ', action.payload)
      // newState.data = action.payload.user
      return newState
        
    case CREATE_PROPERTY_ERROR:
      newState.isUpdating = false
      return newState
    
    default:
      return newState
  }
}

// const rootReducer = combineReducers({
//   properties
// })

export default properties
