'use strict'

// Globals
import React from 'react'
import fetch from 'isomorphic-fetch'
import { API } from './../../config/constants'


// URL
export const URL_SIGN_UP = '/user'


// Action Constants
export const SIGN_UP_TRIGGERED = 'SIGN_UP_TRIGGERED'
export const HANDLE_SIGN_UP_SUCCESS = 'HANDLE_SIGN_UP_SUCCESS'
export const HANDLE_SIGN_UP_ERROR = 'HANDLE_SIGN_UP_ERROR'


// Action Creators
export function signUpTriggered() {
  return {
    type: SIGN_UP_TRIGGERED
  }
}

export function handleSignUpSuccess(currentUser) {
  return {
    type: HANDLE_SIGN_UP_SUCCESS,
    payload: currentUser
  }
}

export function handleSignUpError(err) {
  return {
    type: HANDLE_SIGN_UP_ERROR,
    payload: err,
    error: true
  }
}

export function attemptSignUp(currentUser) {
  return (dispatch) => {
    dispatch(signUpTriggered(currentUser))
    return window.fetch(API.apiServerBase + API.fractionServicesBase + URL_SIGN_UP, {
      method: 'POST',
      body: {
        email: currentUser.email,
        password: currentUser.password
      }
    })
    // TODO (Gavin): Error api handling layer
    // TODO (Gavin): Data storage API calling layer
    .then((res) => {
      return res.json()
    })
    .then((json) => {
      dispatch(handleSignUpSuccess(json))
    })
    .catch((err) => {
      console.log('There was an error:' , err.message)
      dispatch(handleSignUpError(err))
    })
  }
}

