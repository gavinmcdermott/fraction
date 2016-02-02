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

  CURRENT_USER_FETCH_START, 
  CURRENT_USER_FETCH_SUCCESS, 
  CURRENT_USER_FETCH_ERROR 
} from './../constants/actionTypes'
import { AUTH_TOKEN } from './../constants/storageKeys'


const placeholderUser = {
  token: storage.get(AUTH_TOKEN),  // Check the storage for a token
  isLoggedIn: false,
  isFetching: false,
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
      newState.isFetching = true
      newState.data.email.email = action.payload
      return newState
    
    case SIGN_UP_SUCCESS:
      newState.isFetching = false
      newState.data = action.payload
      return newState
        
    case SIGN_UP_ERROR:
      newState.isFetching = false
      return newState


    // LOG_IN

    case LOG_IN_START:
      newState.isFetching = true
      newState.data.email.email = action.payload
      return newState

    case LOG_IN_SUCCESS:
      let { token, user } = action.payload
      // storage the token in localStorage
      storage.set(AUTH_TOKEN, token)
      // Then update the app user
      newState.token = token
      newState.isLoggedIn = true
      newState.isFetching = false
      newState.data = user
      return newState

    case LOG_IN_ERROR:
      newState.isFetching = false
      return newState

      
    // LOG_OUT ()

    case LOG_OUT_START:
      // Remove the token in all cases
      storage.remove(AUTH_TOKEN)
      newState.token = null
      newState.isFetching = true
      return newState

    case LOG_OUT_SUCCESS:
      newState.isFetching = false
      return newState
    
    case LOG_OUT_ERROR:
      newState.isFetching = false
      return newState

    
    // CURRENT_USER_FETCH

    case CURRENT_USER_FETCH_START:
      newState.isFetching = true
      return newState
    
    case CURRENT_USER_FETCH_SUCCESS:
      newState.isFetching = false
      newState.data = action.payload
      return newState
        
    case CURRENT_USER_FETCH_ERROR:
      storage.remove(AUTH_TOKEN)
      newState.token = null
      newState.isFetching = false
      return newState
    
    default:
      return newState
  }
}

// const rootReducer = combineReducers({
//   currentUser
// })

export default currentUser
