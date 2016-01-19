'use strict'

import _ from 'lodash'
import assert from 'assert'
import fetch from 'isomorphic-fetch'

import { ENDPOINTS } from './../constants/endpoints'
import { USER_FETCH_START,
         USER_FETCH_SUCCESS,
         USER_FETCH_ERROR } from './../constants/actionTypes'
import * as ERRORS from './../constants/errorTypes'

import { setAppError, unsetAppError } from './appErrorActions'
import { fJSON, fGet } from './../utils/api'


// USER_FETCH Action Creators

export function userFetchStart() {
  return {
    type: USER_FETCH_START
  }
}

export function userFetchSuccess(data) {
  return {
    type: USER_FETCH_SUCCESS,
    payload: data
  }
}

export function userFetchError(err) {
  return {
    type: USER_FETCH_ERROR,
    payload: err,
    error: true
  }
}

export function userFetch(userId) {
  return (dispatch) => {
    const fetchUrl = ENDPOINTS.USER_FETCH + '/' + userId
    assert(_.isString(userId))

    dispatch(userFetchStart())
    dispatch(unsetAppError(ERRORS.USER_FETCH))

    return fGet(fetchUrl)
      .then(fJSON)
      .then((user) => {
        dispatch(userFetchSuccess(user))
      })
      .catch((err) => {
        dispatch(userFetchError(err))
        dispatch(setAppError(err, ERRORS.USER_FETCH))
      })
  }
}


