'use strict'

// Globals
import assert from 'assert'
import { combineReducers } from 'redux'
import { SIGN_UP_TRIGGERED,
         HANDLE_SIGN_UP_SUCCESS,
         HANDLE_SIGN_UP_ERROR 
} from './../actions/signUpActions'


export const DEFAULT_USER_STATE = {
  currentUser: {
    isLoggedIn: false,
    isFetching: false,
    data: {
      id: undefined,
      name: { first: '', last: '' },
      email: { email: '', verified: false }
    }
  }
}


// Style Question: this reducer function is named after the data it mutates
// Because this expects an object with the currentUser property being passed in

export function currentUserFromSignUp(state=DEFAULT_USER_STATE, action) {
  // Never mutate the incoming state, use Object.assign
  let newState = Object.assign({}, state)

  switch (action.type) {
    case SIGN_UP_TRIGGERED:
      newState.currentUser.isFetching = true
      newState.currentUser.data.email.email = action.payload.email
      return newState
    case HANDLE_SIGN_UP_SUCCESS:
      newState.currentUser.isFetching = false
      newState.currentUser.data = action.payload.user
      return newState
    case HANDLE_SIGN_UP_ERROR:
      newState.currentUser.isFetching = false
      return newState
    default:
      return state
  }
}

const rootReducer = combineReducers({
  currentUserFromSignUp
})

export default rootReducer

