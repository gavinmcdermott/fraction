import * as actions from './../signUpActions'

describe('Sign Up Actions: ', () => {

  describe('Action Types: ', () => {
    
    it('should have the right action types', () => {    
      expect(actions.SIGN_UP_TRIGGERED).toEqual('SIGN_UP_TRIGGERED');
      expect(actions.HANDLE_SIGN_UP_SUCCESS).toEqual('HANDLE_SIGN_UP_SUCCESS');
      expect(actions.HANDLE_SIGN_UP_ERROR).toEqual('HANDLE_SIGN_UP_ERROR');
    })
  })

  describe('Synchronous Action Creators: ', () => {
    
    it('should create a valid signup attempt action', () => {
      let expectedAction = {
        type: actions.SIGN_UP_TRIGGERED
      }
      expect(actions.signUpTriggered()).toEqual(expectedAction)
    })

    it('should create a valid signup success action', () => {
      let user = { name: 'Gavin' }
      let expectedAction = {
        type: actions.HANDLE_SIGN_UP_SUCCESS,
        payload: user
      }
      expect(actions.handleSignUpSuccess(user)).toEqual(expectedAction)
    })

    it('should create a valid signup error action', () => {
      let error = new Error()
      let expectedAction = {
        type: actions.HANDLE_SIGN_UP_ERROR,
        payload: error,
        error: true
      }
      expect(actions.handleSignUpError(error)).toEqual(expectedAction)
    })
  })


  describe('Async Action Creators: ', () => {
    // Best practice for tests needed
  })

})
