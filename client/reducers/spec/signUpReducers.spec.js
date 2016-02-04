import { ATTEMPT_SIGN_UP_TRIGGERED,
         HANDLE_SIGN_UP_SUCCESS,
         HANDLE_SIGN_UP_ERROR 
} from './../../actions/signUpActions'

import * as reducers from './../signUpReducers'

describe('Sign Up Reducers: ', () => {
    
  it('should return the initial state', () => {  
    expect(reducers.currentUserFromSignUp(undefined, {})).toEqual(reducers.DEFAULT_USER_STATE)
  })

  it('should set new user info on a signup attempt', () => {  
    let testEmail = 'user@foo.com'
    
    // set up the state's user we expect
    let newState = Object.assign({}, reducers.DEFAULT_USER_STATE)
    newState.currentUser.data.email.email = testEmail
    newState.currentUser.isFetching = true
    
    // set up the test action
    let action = { type: ATTEMPT_SIGN_UP_TRIGGERED, payload: { email: testEmail }}

    expect(reducers.currentUserFromSignUp(reducers.DEFAULT_USER_STATE, action)).toEqual(newState)
  })

  it('should set new user info on a signup failure', () => {  
    let testEmail = 'user@foo.com'
    
    // set up the state's user we expect
    let newState = Object.assign({}, reducers.DEFAULT_USER_STATE)
    newState.currentUser.data.email.email = testEmail
    
    // set up the test action
    let action = { type: ATTEMPT_SIGN_UP_TRIGGERED, payload: { email: testEmail }}

    expect(reducers.currentUserFromSignUp(reducers.DEFAULT_USER_STATE, action)).toEqual(newState)
  })


})