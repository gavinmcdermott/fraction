'use strict'

// Globals
import { combineReducers } from 'redux'
import storage from './../vendor/store'

import { 
  SIGN_UP_START, 
  SIGN_UP_SUCCESS, 
  SIGN_UP_ERROR,
  
  LOG_IN_START, 
  LOG_IN_SUCCESS, 
  LOG_IN_ERROR,

  LOG_OUT_START,
  LOG_OUT_SUCCESS,
  LOG_OUT_ERROR,

  FETCH_CURRENT_USER_START, 
  FETCH_CURRENT_USER_SUCCESS, 
  FETCH_CURRENT_USER_ERROR 
} from './../constants/actionTypes'
import { AUTH_TOKEN } from './../constants/storageKeys'


const placeholderUser = {
  token: storage.get(AUTH_TOKEN),  // Check the storage for a token
  isLoggedIn: false,
  isUpdating: false,
  data: {
    id: null,
    name: { first: '', last: '' },
    email: { email: '', verified: false }
  }
}

export function currentUser(state=placeholderUser, action) {
  let newState = Object.assign({}, state)
  
  switch (action.type) {
    
    // SIGN_UP
    case SIGN_UP_START:
      newState.isUpdating = true
      newState.data.email.email = action.payload
      return newState
    
    case SIGN_UP_SUCCESS:
      newState.isUpdating = false
      newState.data = action.payload
      return newState
        
    case SIGN_UP_ERROR:
      newState.isUpdating = false
      return newState


    // LOG_IN
    case LOG_IN_START:
      newState.isUpdating = true
      newState.data.email.email = action.payload.email
      return newState

    case LOG_IN_SUCCESS:
      // storage the token in localStorage
      storage.set(AUTH_TOKEN, action.payload.token)
      // Then update the app user
      newState.token = action.payload.token
      newState.isLoggedIn = true
      newState.isUpdating = false
      newState.data = action.payload.user
      return newState

    case LOG_IN_ERROR:
      newState.isUpdating = false
      return newState

      
    // LOG_OUT
    case LOG_OUT_START:
      // Remove the token in all cases
      storage.remove(AUTH_TOKEN)
      newState.token = null
      newState.isUpdating = true
      return newState

    case LOG_OUT_SUCCESS:
      newState.isUpdating = false
      return newState
    
    case LOG_OUT_ERROR:
      newState.isUpdating = false
      return newState

    
    // FETCH_CURRENT_USER
    case FETCH_CURRENT_USER_START:
      newState.isUpdating = true
      return newState
    
    case FETCH_CURRENT_USER_SUCCESS:
      newState.isLoggedIn = true
      newState.isUpdating = false
      newState.data = action.payload.user
      return newState
        
    case FETCH_CURRENT_USER_ERROR:
      storage.remove(AUTH_TOKEN)
      newState.token = null
      newState.isUpdating = false
      return newState
    
    default:
      return newState
  }
}

// const rootReducer = combineReducers({
//   currentUser
// })

export default currentUser
