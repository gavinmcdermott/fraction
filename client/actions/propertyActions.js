'use strict'

import _ from 'lodash'
import assert from 'assert'
import fetch from 'isomorphic-fetch'

import { ENDPOINTS } from './../constants/endpoints'
import { 
  CREATE_PROPERTY_START,         
  CREATE_PROPERTY_SUCCESS,
  CREATE_PROPERTY_ERROR 
} from './../constants/actionTypes'
import * as ERRORS from './../constants/errorTypes'

import { setAppError, unsetAppError } from './appErrorActions'
import { fJSON, fPost, handleUnauthorized } from './../utils/api'


// CREATE_PROPERTY Action Creators

export function createPropertyStart() {
  return {
    type: CREATE_PROPERTY_START
  }
}

export function createPropertySuccess(data) {
  return {
    type: CREATE_PROPERTY_SUCCESS,
    payload: data
  }
}

export function createPropertyError(err) {
  return {
    type: CREATE_PROPERTY_ERROR,
    payload: err,
    error: true
  }
}

export function createProperty(newProp) {
  return (dispatch) => {
    const postBody = {
      property: {
        location: { 
          address1: newProp.address1, 
          address2: newProp.address2, 
          city: newProp.city, 
          state: newProp.state,
          zip: newProp.zip 
        },
        details: {
          stats: { 
            bedrooms: newProp.bedrooms,
            bathrooms: newProp.bathrooms,
            sqft: newProp.sqft 
          }
        }
      }
    }
    const createPropertyUrl = ENDPOINTS.PROPERTIES

    dispatch(createPropertyStart())
    dispatch(unsetAppError(ERRORS.CREATE_PROPERTY))

    return fPost(createPropertyUrl, postBody)
      .then(fJSON)
      .then((data) => {
        console.log('DDD: ', data.payload)
        // dispatch(createPropertySuccess(data.payload))
      })
      .catch(handleUnauthorized(dispatch))
      .catch((err) => {
        console.log('EEE: ', err.payload)
        // dispatch(createPropertyError(err.payload))
        // dispatch(setAppError(err.payload, ERRORS.CREATE_PROPERTY))
      })
  }
}
