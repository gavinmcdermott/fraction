'use strict'

import _ from 'lodash'
import mongoose from 'mongoose'

let propertySchema = new mongoose.Schema({

  location: {
    address1: { type: String, required: true },
    address2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    stateAbbr: { type: String, required: true },
    formattedAddress: { type: String, required: true },
    zip: { type: String, required: true },
    lat: { type: String, required: true },
    lon: { type: String, required: true }, 
  },

  // TODO
 documents: [{type: mongoose.Schema.Types.ObjectId, ref: 'Document'}],

  details: {
    description: {type: String},
    stats: {
      bedrooms: { type: Number },
      bathrooms: { type: Number },
      sqft: { type: Number },
      lotSize: { type: Number },
      // TODO make own types and
      type: { type: String }, 
      dateBuilt: { type: Date },
    },
    improvements: [{ 
      type: { type: String },
      date: { type: Number },
      estValue: { type: Number },
      estCost: { type: Number },
    }],
  },

  // TODO need shares db to keep track of
  // TODO marketplace function and price
  // TODO (both user and house should point 
  // TODO to this)

  financials: {
    appraisals: [{
      source: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
      price: { type: String },
      date: {type: Date }
    }],
    // TODO think on how to verify these
    // TODO think if this comes out of house
    // TODO and into event
    avgRentalPrice: { type: Number },
    avgDaysBooked: { type: Number },
    taxes: [{
      amount: { type: Number },
      date: { type: Date },
      type: { type: String },
      // TODO 
      sourceDoc: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' }
    }],
    // TODO think on whether old sale data from 
    // TODO pre fraction days is relevant
  },

  // primaryContact: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  dateAdded: { type: Date },

})

propertySchema.methods = {

  toPublicObject: function() {
    // TODO: CLEAN UP THE ID!!!
    // TODO: CLEAN UP THE ID!!!
    // TODO: CLEAN UP THE ID!!!
    // let scrubbedProp = Object.assign({}, this)
    // scrubbedProp.id = this._id.toString()
    return {
      id: this._id.toString(),
      location: this.location,
      documents: this.documents,
      details: this.details,
      financials: this.financials,
      dateAdded: this.dateAdded
    }
  }

}


// index?

let Property = mongoose.serviceDb.model('Property', propertySchema)


module.exports = Property
