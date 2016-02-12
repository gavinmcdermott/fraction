'use strict'

// Globals
import _ from 'lodash'
import { combineReducers } from 'redux'
import storage from './../vendor/store'
import moment from 'moment'

import {
  CREATE_PROPERTY_START, 
  CREATE_PROPERTY_SUCCESS, 
  CREATE_PROPERTY_ERROR,

  FETCH_PROPERTIES_START,
  FETCH_PROPERTIES_SUCCESS,
  FETCH_PROPERTIES_ERROR,
} from './../constants/actionTypes'

const CACHE_INVALIDATION_INTERVAL = moment.duration(5, 'minutes')

const placeholderProperties = {
  isUpdating: false,
  lastUpdated: null,
  cacheInvalidationInterval: CACHE_INVALIDATION_INTERVAL,
  propertiesById: {},
  propertiesList: [],
}

export function properties(state=placeholderProperties, action) {
  let newState = Object.assign({}, state)
  let newProperty
  let newProperties
  
  switch (action.type) {
    
    // CREATE_PROPERTY
    case CREATE_PROPERTY_START:
      newState.isUpdating = true
      return newState
    
    case CREATE_PROPERTY_SUCCESS:
      newState.isUpdating = false
      newProperty = action.payload.property
      newState.propertiesById[newProperty.id] = newProperty
      newState.propertiesList.push(newProperty)
      newState.lastUpdated = moment()
      // console.log('ADDED A NEWLY CREATED PROP: ', newProperty)
      return newState
        
    case CREATE_PROPERTY_ERROR:
      newState.isUpdating = false
      return newState


    // FETCH_PROPERTIES
    case FETCH_PROPERTIES_START:
      newState.isUpdating = true
      return newState
    
    case FETCH_PROPERTIES_SUCCESS:
      newState.isUpdating = false
      
      // If the call wants cached data, simply return that
      if (action.payload.loadFromCache) {
        return newState
      }

      // Otherwise, the incoming payload has the latest properties from the server
      newProperties = action.payload.properties
      // update all properties by key
      _.forEach(newProperties, (prop) => {
        newState.propertiesById[prop.id] = prop
      })
      // merge the old properties array into the new properties -> this enforces
      // that the new properties will overwrite the old
      let updatedProperties = _.unionWith(newProperties, newState.propertiesList, (newProp, oldProp) => {
        return newProp.id === oldProp.id
      })
      newState.propertiesList = updatedProperties
      newState.lastUpdated = moment()
      // console.log('LOADED ALL PROPS INTO STATE: ', newState)
      return newState
        
    case FETCH_PROPERTIES_ERROR:
      newState.isUpdating = false
      return newState
    
    default:
      return newState
  }
}

// const rootReducer = combineReducers({
//   properties
// })

export default properties
