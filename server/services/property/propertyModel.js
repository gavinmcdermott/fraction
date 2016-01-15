'use strict';

import _ from 'lodash';
import mongoose from 'mongoose';

let propertySchema = new mongoose.Schema({

  location: {
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    neighborhood: { type: String },
    city: { type: String, required: true },
    county: { type: String },
    state: { type: String, required: true },
    zip: { type: Number, required: true }
    // lat: { type: String },
    // lon: { type: String }, 
    // someday schools            
  },

  // TODO
  // documents: [{id: mongoose.Schema.Types.ObjectId, ref: 'Document'}],

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
      estCost: { type: Number},
    }],
  },

  // TODO need shares db to keep track of
  // TODO marketplace function and price
  // TODO (both user and house should point 
  // TODO to this)
  financials: {
    appraisals: [{
      source: {type: String},
      price: {type: String},
      date: {type: Date}
    }],
    // TODO think on how to verify these
    // TODO think if this comes out of house
    // TODO and into event
    avgRentalPrice: {type: Number},
    avgDaysBooked: {type: Number},
    taxes: [{
      amount: { type: Number},
      date: { type: Date },
      type: { type: String },
      // TODO 
      // sourceDoc: { type: mongoose.Schema.Types.ObjectId, ref: 'Document'}
    }],
    // TODO think on whether old sale data from 
    // TODO pre fraction days is relevant
  },

  primaryContact: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  dateAdded: { type: Date },

})

propertySchema.methods = {

  toPublicObject: () => {
    // let scrubbedProp = Object.assign({}, this)
    // scrubbedProp.id = this._id.toString()
    return this 
  }

}



// index?

let Property = mongoose.serviceDb.model('Property', propertySchema);

module.exports = Property;