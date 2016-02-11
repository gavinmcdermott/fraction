'use strict'

import _ from 'lodash'
import assert from 'assert'
import fetch from 'isomorphic-fetch'

import { ENDPOINTS } from './../constants/endpoints'
import { 
  CREATE_PROPERTY_START,         
  CREATE_PROPERTY_SUCCESS,
  CREATE_PROPERTY_ERROR,

  FETCH_PROPERTIES_START,
  FETCH_PROPERTIES_SUCCESS,
  FETCH_PROPERTIES_ERROR,
} from './../constants/actionTypes'
import * as ERRORS from './../constants/errorTypes'

import { setAppError, unsetAppError } from './appErrorActions'
import { fJSON, fPost, fGet, handleUnauthorized } from './../utils/api'


// CREATE_PROPERTY Action Creators

function createPropertyStart() {
  return {
    type: CREATE_PROPERTY_START
  }
}

function createPropertySuccess(data) {
  return {
    type: CREATE_PROPERTY_SUCCESS,
    payload: data
  }
}

function createPropertyError(err) {
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
        console.log('Created property success: ', data.payload)
        dispatch(createPropertySuccess(data.payload))
      })
      .catch(handleUnauthorized(dispatch))
      .catch((err) => {
        console.log('Created property fail: ', err.payload)
        dispatch(createPropertyError(err.payload))
        dispatch(setAppError(err.payload, ERRORS.CREATE_PROPERTY))
      })
  }
}


// FETCH_PROPERTIES Action Creators

function fetchPropertiesStart() {
  return {
    type: FETCH_PROPERTIES_START
  }
}

function fetchPropertiesSuccess(data) {
  return {
    type: FETCH_PROPERTIES_SUCCESS,
    payload: data
  }
}

function fetchPropertiesError(err) {
  return {
    type: FETCH_PROPERTIES_ERROR,
    payload: err,
    error: true
  }
}

export function fetchProperties() {
  return (dispatch) => {
    const fetchPropertiesUrl = ENDPOINTS.PROPERTIES

    dispatch(fetchPropertiesStart())
    dispatch(unsetAppError(ERRORS.FETCH_PROPERTIES))

    return fGet(fetchPropertiesUrl)
      .then(fJSON)
      .then((data) => {
        console.log('Success fetch props: ', data.payload)
        dispatch(fetchPropertiesSuccess(data.payload))
      })
      .catch(handleUnauthorized(dispatch))
      .catch((err) => {
        console.log('Error fetching props: ', err.payload)
        dispatch(fetchPropertiesError(err.payload))
        dispatch(setAppError(err.payload, ERRORS.FETCH_PROPERTIES))
      })
  }
}













