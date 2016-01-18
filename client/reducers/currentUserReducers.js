'use strict'

// Globals
import { combineReducers } from 'redux'
import { SIGN_UP_START,
         SIGN_UP_SUCCESS,
         SIGN_UP_ERROR } from './../constants/actionTypes'

const placeholderUser = {
  isLoggedIn: false,
  isFetching: false,
  data: {
    id: undefined,
    name: { first: '', last: '' },
    email: { email: '', verified: false }
  }
}

export function currentUser(state=placeholderUser, action) {
  let newState = Object.assign({}, state)
  switch (action.type) {
    case SIGN_UP_START:
      newState.isFetching = true
      newState.data.email.email = action.payload
      return newState
    case SIGN_UP_SUCCESS:
      newState.isFetching = false
      newState.data = action.payload.user
      return newState
    case SIGN_UP_ERROR:
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
